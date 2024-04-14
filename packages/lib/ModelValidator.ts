import type { FieldTypes, ValueType } from "./types/Field";
import type { ModelType } from "./types/Model";
import z from "zod";
import { AxTypes, type AxType } from "./types/Types";
export type Error = {
    modelId: string;
    fieldId?: string;
    error: string;
}
const ModelError = (model: ModelType, field: FieldTypes | undefined, error: string): Error => {
    return {
        modelId: model._id,
        fieldId: field?._id,
        error: error
    }
}

export const ModelValidator = (models: ModelType[]) => {
    const errors: Error[] = [];
    const expect = (check: boolean, model: ModelType, field: FieldTypes | undefined, error: string) => {
        if (!check) {
            errors.push(ModelError(model, field, error))
        }
    }
    for (const model of models) {
        expect(model.name.trim() !== "", model, undefined, "モデル名が空です");
        expect(Regexes.name.test(model.name), model, undefined, "モデル名が不正です");
        for (const field of model.fields) {
            expect(field.name.trim() !== "", model, field, "フィールド名が空です");
            expect(Regexes.name.test(field.name), model, field, "フィールド名が不正です");
            if (field.fieldType === "value") {
                
            } else if (field.fieldType === "relation") {

            }
        }
    }
};

/* const ValueValidator:{[K in AxType["id"]]:(field:ValueType<D,(typeof AxTypes)[K]>,v:string)=>boolean} = {
    string: (ax,v) => {
        return true;
    },
    int: (ax,v) => {
        const n = Number(v);
        if(v.trim() === ""||Number.isNaN(n)) return false;

    },
} */

const Regexes = {
    name: /^[a-zA-Z][a-zA-Z0-9_]*$/,
}