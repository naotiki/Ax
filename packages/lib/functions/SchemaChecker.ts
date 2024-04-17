import { Operation, diff, flattenChangeset } from "json-diff-ts";
import type { ModelType } from "../types/Model";
//追加された変更を取得 このID以下の変更は絶対に安全
export const getAddedElement = (oldSchema: ModelType[], schema: ModelType[]) => {
    const d = diff(oldSchema, schema)
    const changes = flattenChangeset(d)
    const added: {
        modelIds: string[],
        fieldIds: string[],
    } = { modelIds: [], fieldIds: [] }
    for (const change of changes) {
        if (change.type === Operation.ADD) {
            if (change.path.includes("models")) {
                added.modelIds.push(change.value._id)
            } else if (change.path.includes("fields")) {
                added.fieldIds.push(change.value._id)
            }
        }
    }
};
