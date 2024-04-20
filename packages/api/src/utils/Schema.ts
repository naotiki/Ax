import type { BunFile } from 'bun';
import { ModelValidator, PrismaSchemaGenerator, type ModelType,type Schema as SchemaType } from 'lib'

export class Schema {
    cache: SchemaType = [];
    private file: BunFile;
    constructor(file: BunFile) {
        this.file = file;
        (async () => {
            this.cache = (await file.exists()) ? await file.json() : []
        })()
    }
    updateSchema = async (schema: SchemaType) => {
        await Bun.write(this.file, JSON.stringify(schema, null, 2))
        this.cache = schema
    }
}