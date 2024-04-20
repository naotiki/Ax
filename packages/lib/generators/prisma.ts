import { toCamelCase } from "../../frontend/app/generator-app/utils/CaseUtils";
import { checkFieldType, type ValueType } from "../types/Field";
import type { Schema } from "../types/Model";
import { getAxTypeData, type AxTypes } from "../types/Types";

export const PrismaSchemaGenerator = (models: Schema, headerContents: string, write: (s: string) => void) => {
    write(headerContents);
    for (const model of models) {
        const addContents: string[] = [];
        write(`model ${model.name} {\n`);
        for (const field of model.fields) {
            if (field.fieldType === "value") {
                let typeName:string = getAxTypeData(field.axType).db
                if (checkFieldType(field, "Enum")) {
                    //Enum名の重複チェック
                    if(models.filter(m=>m.fields.find(f=>f.fieldType==="value"&&checkFieldType(f,"Enum")&&f.typeParams.name===field.typeParams.name)).length>1){
                        throw new Error(`Enum Name Duplication Error: ${field.typeParams.name}`)
                    }
                    typeName = field.typeParams.name;
                    let str = `enum ${typeName} {\n\t`;
                    str += field.typeParams.entries.map(v => `${v.value}`).join("\n\t");
                    str += "\n}\n";
                    addContents.push(str);
                }

                write(`\t${field.name}   ${typeName}${field.optional ? "?" : ""}`);
                if (field.id) {
                    write(" @id");
                }
                if (field.unique) {
                    write(" @unique");
                }
                if (checkFieldType(field, "date") && field.typeParams.updatedAt) {
                    write(" @updatedAt");
                }
                if (field.default) {
                    write(` @default(${field.default.type === "value" ?
                        field.axType === "string" ? `"${field.default.defaultValue}"` : field.default.defaultValue
                        : field.default.expression})`);
                }

            }else if(field.fieldType === "relation"){
                const relationModel = models.find(m=>m._id===field.relation.modelId)
                const relationField = relationModel?.fields.find(f=>f._id===field.relation.relationFieldIds[0]) as ValueType<AxTypes>;
                if (!relationModel) {
                    throw new Error("Relation Model Not Found");
                }
                const fieldForRelation={
                    name:`${toCamelCase(relationModel.name)}${relationField.name[0].toUpperCase()}${relationField.name.slice(1)}`,
                    dbType:getAxTypeData(relationField.axType).db
                }
                write(`\t${field.name} ${models.find(m=>m._id===field.relation.modelId)?.name}`)
                write(` @relation(fields: [${fieldForRelation.name}], references: [${relationField.name}])`)
                write("\n")
                write(`\t${fieldForRelation.name} ${fieldForRelation.dbType}${/* field.optional ? "?" : "" */""}`)
            }
            write("\n");
        }//Field End
        for (const m of models) {
            if (m._id === model._id) continue;
            for (const f of m.fields) {
                if (f.fieldType==="relation"&&f.relation.modelId===model._id) {
                    toCamelCase(m.name)

                    write(`\t${toCamelCase(m.name)} ${m.name}[]\n`)
                }
            }
        }
        write("}\n");
        for (const addContent of addContents) {
            write(`\n${addContent}\n`);
        }
    }//Model End

}