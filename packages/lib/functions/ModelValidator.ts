import { checkFieldType, type FieldTypes, type ValueType } from "../types/Field";
import type { ModelType, Schema } from "../types/Model";
import type { AxTypes } from "../types/Types";
const SchemaIssueLevels = ["error", "warn", "suggest"] as const
type SchemaIssueLevel = typeof SchemaIssueLevels[number]
export type ModelValidateError = {
    modelId: string;
    fieldId?: string;
    msg: string;
    description?: string;
    level: SchemaIssueLevel;
}
/* const ModelError = (model: ModelType, field: FieldTypes | undefined, error: string): ModelValidateError => {
    return {
        modelId: model._id,
        fieldId: field?._id,
        msg: error,
        level: "error"
    }
} */

const createSchemaIssue = (model: ModelType, field: FieldTypes | undefined, msg: string, level: SchemaIssueLevel, description?: string): ModelValidateError => {
    return {
        modelId: model._id,
        fieldId: field?._id,
        msg: msg,
        level: level,
        description: description
    }
}

export const SchemaValidator = async (models: Schema) => {
    const issues: ModelValidateError[] = [];
    const expect = (mustBe: boolean, model: ModelType, field: FieldTypes | undefined, msg: string, level: SchemaIssueLevel = "error", description?: string) => {
        if (!mustBe) {
            issues.push(createSchemaIssue(model, field, msg, level, description))
        }
    }
    for (const model of models) {
        expect(Regexes.name.test(model.name), model, undefined, "テーブル名が不正です",);
        //modelNameの重複をチェック
        const sameNameModels = models.filter(m => m.name === model.name);
        expect(sameNameModels.length === 1, model, undefined, "テーブル名が重複しています");
        //ModelにはIDカラムが必要
        //複数IDの禁止
        const idFields = model.fields.filter(f => f.fieldType === "value" && f.id);
        expect(idFields.length !== 0, model, undefined, "IDカラムが存在しません");
        expect(idFields.length === 1 || idFields.length === 0, model, undefined, "IDカラムは1つのみ設定できます");
        for (const field of model.fields) {
            expect(Regexes.name.test(field.name), model, field, "カラム名が不正です");
            //カラム名に_rowは使えない
            expect(field.name !== "_row", model, field, "カラム名に「_row」は使えません");
            //fieldNameの重複をチェック
            const sameNameFields = model.fields.filter(f => f.name === field.name);
            expect(sameNameFields.length === 1, model, field, "カラム名が重複しています");

            if (field.fieldType === "value") {

                //ルールの破綻をチェック
                for (const rule of field.meta.rules) {
                    switch (rule.ruleName) {
                        case "length": {
                            expect(rule.params.minLength !== undefined || rule.params.maxLength !== undefined, model, field, "長さルールには最小長か最大長のどちらかを指定してください");
                            expect(rule.params.minLength === undefined || rule.params.maxLength === undefined || rule.params.minLength <= rule.params.maxLength, model, field, "最小長が最大長より大きいです");
                            break;
                        }
                        case "regex": {
                            expect(rule.params.regex !== undefined, model, field, "パターンルールにはパターンを指定してください");
                            break;
                        }
                        case "range": {
                            expect(rule.params.min !== undefined || rule.params.max !== undefined, model, field, "範囲ルールには最小値か最大値のどちらかを指定してください");
                            expect(rule.params.min === undefined || rule.params.max === undefined || rule.params.min <= rule.params.max, model, field, "最小値が最大値より大きいです");
                            break;
                        }
                    }
                }
                //デフォルト値をチェック
                if (field.default) {
                    switch (field.default.type) {
                        case "value": {
                            if (field.default.defaultValue !== null && checkFieldType(field, field.axType)) {
                                const f = <T extends AxTypes>(field: ValueType<T>, v: string) => {
                                    return ValueValidator[field.axType](field, v)
                                }
                                expect(f(field, field.default.defaultValue), model, field, "デフォルト値が不正です");
                            } else {
                                expect(field.optional, model, field, "デフォルト値が「空」ですが「空」は許可されていません");
                            }
                            break;
                        }
                    }
                }
                if (field.id) {
                    expect(field.meta.readonly, model, field, "IDカラムが変更可能です", "warn", "整合性を保つため、IDカラムは変更禁止にしましょう。");
                    expect(!field.optional, model, field, "IDカラムは「空」を許可しない必要があります");
                }
                //Enumの名前チェック
                if (checkFieldType(field, "Enum")) {
                    expect(Regexes.name.test(field.typeParams.name), model, field, "選択肢グループ名が不正です");
                    expect(field.typeParams.entries.length > 0, model, field, "選択肢が存在しません");

                    for (const entry of field.typeParams.entries) {
                        expect(Regexes.name.test(entry.value), model, field, "選択肢の名前が不正です");
                        const sameValueEntries = field.typeParams.entries.filter(e => e.value === entry.value);
                        expect(sameValueEntries.length === 1, model, field, "選択肢の名前が重複しています");
                    }
                }
            } else if (field.fieldType === "relation") {
                //テーブルが存在する 
                const relationModel = models.find(m => m._id === field.relation.modelId);
                expect(relationModel !== undefined, model, field, "関連付けるテーブルが存在しません");
                //関連カラムが存在する
                const relationField = relationModel?.fields.find(f => f._id === field.relation.relationFieldIds[0]);
                expect(relationField !== undefined, model, field, "関連付けるカラムが存在しません");
                //DisplayColumnが存在する
                if (field.meta.displayColumn) {
                    expect(relationModel?.fields.find(f => f._id === field.meta.displayColumn) !== undefined, model, field, "表示用カラムが存在しません");
                }
            }
        }
    }
    //issueをerror,warn,suggestの順に並び替える
    return issues.sort((a, b) => {
        return SchemaIssueLevels.indexOf(a.level) - SchemaIssueLevels.indexOf(b.level);
    })
};
const ValueValidator: { [K in AxTypes]: (field: ValueType<K>, v: string) => boolean } = {
    string: (f, v) => {
        for (const rule of f.meta.rules) {
            switch (rule.ruleName) {
                case "length": {
                    if ((rule.params.minLength && v.length < rule.params.minLength) || (rule.params.maxLength && v.length > rule.params.maxLength)) return false;
                    break;
                }
                case "regex": {
                    if (!new RegExp(rule.params.regex).test(v)) return false;
                    break;
                }
            }
        }

        return true;
    },
    int: (f, v) => {
        const n = Number(v);
        if (v.trim() === "" || Number.isNaN(n)) return false;
        for (const rule of f.meta.rules) {
            switch (rule.ruleName) {
                case "range": {
                    if ((rule.params.min && n < rule.params.min) || (rule.params.max && n > rule.params.max)) return false;
                    break;
                }
            }
        }
        return true;
    },
    float: (f, v) => {
        const n = Number(v);
        if (v.trim() === "" || Number.isNaN(n)) return false;
        for (const rule of f.meta.rules) {
            switch (rule.ruleName) {
                case "range": {
                    if ((rule.params.min && n < rule.params.min) || (rule.params.max && n > rule.params.max)) return false;
                    break;
                }
            }
        }
        return true;
    },
    decimal: (f, v) => {
        const n = Number(v);
        if (v.trim() === "" || Number.isNaN(n)) return false;
        for (const rule of f.meta.rules) {
            switch (rule.ruleName) {
                case "range": {
                    if ((rule.params.min && n < rule.params.min) || (rule.params.max && n > rule.params.max)) return false;
                    break;
                }
            }
        }
        return true;
    },
    bool: (f, v) => {
        return v === "true" || v === "false";
    },
    date: (f, v) => {
        return !Number.isNaN(Date.parse(v));
    },
    Enum: (f, v) => {
        return f.typeParams.entries.map(e => e.value).includes(v);
    },
    Array: (f, v) => {
        return true;
    }
}

const Regexes = {
    name: /^[a-zA-Z][a-zA-Z0-9_]*$/,
}

