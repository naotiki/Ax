import type { FieldDefault } from "../types/Field";
import type { DBType } from "../types/Types";

export const DefaultValueProviders = {
    autoIncrement: {
        type: "provider",
        dbType: "Int",
        name: "連番",
        id: "autoIncrement",
        expression:"autoincrement()"
    },
    uuid: {
        type: "provider",
        dbType: "String",
        name: "UUID",
        id: "uuid",
        expression:"uuid()"
    },
    cuid: {
        type: "provider",
        dbType: "String",
        name: "CUID",
        id: "cuid",
        expression:"cuid()"
    },
    now: {
        type: "provider",
        dbType: "Date",
        name: "現在日時",
        id: "now",
        expression:"now()"
    },
    
    
} satisfies Record<string, FieldDefault<DBType>>;