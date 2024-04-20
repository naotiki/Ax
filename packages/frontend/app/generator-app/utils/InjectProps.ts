import type { EditLevel } from "../AxEditor"
import type { SchemaEditorData } from "../components/EditSchemaContext"

export const injectProps = (ctx:SchemaEditorData,level: EditLevel, bypass?: boolean) => {
    return {
        disabled: bypass === true ? false : !ctx.allowedLevel.includes(level)
    }
}