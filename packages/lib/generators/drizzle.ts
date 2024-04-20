import { type PgTable, pgTable, serial, type PgTableWithColumns, type TableConfig } from "drizzle-orm/pg-core";
import type { ModelType, Schema } from "../types/Model";

export const DrizzleGenerator= (schema:Schema)=>{
    const objectEntries:[string,PgTable<TableConfig>][] = []
    for (const model of schema){
        objectEntries.push([
            model.name,
            pgTable(model.name,{
                    id:serial("")
            })
        ])
        
    }
}