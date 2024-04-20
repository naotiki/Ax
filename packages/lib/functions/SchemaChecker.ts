import { Operation, diff, flattenChangeset } from "json-diff-ts";
import type { ModelType, Schema } from "../types/Model";
import jsonpath from "jsonpath";
//追加された変更を取得 このID以下の変更は絶対に安全
export const getAddedElement = (oldSchema: Schema, schema: Schema) => {
    const d = diff(oldSchema, schema)
    const changes = flattenChangeset(d)
    const added: {
        modelIds: string[],
        fieldIds: string[],
    } = { modelIds: [], fieldIds: [] }

    for (const change of changes) {
        if (change.type === Operation.ADD) {
            if (/^\$\.\$root\[\d+\]\.fields\[\d+\]$/.test(change.path)) {
                added.fieldIds.push(change.value._id)
            } else if (/^\$\.\$root\[\d+\]$/.test(change.path)) {
                added.modelIds.push(change.value._id)
            }
        }
    }
    return added

};

export const getSchemaDiff = (oldSchema: Schema, schema: Schema) => {
    const diffs:{
        type:Operation,
        modelId:string,
        withBreakingChanges:boolean,
        fieldDiffs:{
            type:Operation,
            fieldId:string,
            withBreakingChanges:boolean
        }[]
    }=[]
    const d = diff(oldSchema, schema)
    const changes = flattenChangeset(d)
    
    for (const change of changes) {
        if (condition) {
            
        }else if (/^\$\.\$root\[(?<modelIndex>\d+)\]\.fields$/.exec(change.path)) {
            //added.fieldIds.push(change.value._id)
        } else if (/^\$\.\$root\[\d+\]$/.test(change.path)) {
            //added.modelIds.push(change.value._id)
        }
    }
}