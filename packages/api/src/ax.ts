
import { Prisma, type PrismaClient } from '@prisma/client'
import { Mutex } from 'async-mutex'
import { $, fileURLToPath, pathToFileURL } from 'bun'
import { Hono } from 'hono'
import { diff, flattenChangeset, Operation } from 'json-diff-ts'
import { ModelValidator, PrismaSchemaGenerator, type ModelType,type Schema as SchemaType } from 'lib'
import { Schema } from './utils/Schema'
import { date, integer, pgTable,timestamp } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres'
import { datetime, mysqlTable } from 'drizzle-orm/mysql-core'
const axApi = new Hono()
const headerContents = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
generator client {
	provider        = "prisma-client-js"
  output   = "./client"
}
`

const dataDir = `${import.meta.dir}/../../../.axcel/`
const schemaFile = Bun.file(`${dataDir}schema.json`)
const schemaRepository = new Schema(schemaFile)
axApi.get("/schema", async (c) => {
    return c.json<SchemaType>(schemaRepository.cache)
})

axApi.get("/diff", async (c) => {
    const models = await c.req.json<Schema>()
    const result = diff([], models,)
    return c.json(result)
});
const migrateMutex = new Mutex()
const prismaBaseDir = `${dataDir}prisma/`
let prismaClientLib = await import(`${prismaBaseDir}client/index.js`)
let prisma = new prismaClientLib.PrismaClient() as PrismaClient
let oldSchema: SchemaType = []
axApi.post('/migrate', async (c) => {
    const { oldCheckSum, schema } = await c.req.json<{
        oldCheckSum: string,
        schema: SchemaType
    }>();
    const release = await migrateMutex.acquire()
    const r = diff(oldSchema, schema,)
    oldSchema = schema
    const changes = flattenChangeset(r)
    let breakingChanges = false
    for (const change of changes) {
        change.path// `meta`が入っていたらAxcel側のみの変更 非破壊変更ではない。
        if (!change.path.includes("meta")) {
            breakingChanges = true
            break
        }
    }

    //もし破壊的変更があればPrisma Schemaを生成しマイグレーション。
    if (breakingChanges) {
        console.log("Breaking Changes");

        const errors = await ModelValidator(schema)
        if (errors.length > 0) {
            return c.json(errors, 400)
        }
        const schemaPath = `${prismaBaseDir}schema.prisma`
        const writer = Bun.file(schemaPath).writer()
        PrismaSchemaGenerator(schema, headerContents, (s) => writer.write(s))
        writer.end()
        await $`bun prisma generate --schema ${schemaPath}`
        await $`bun prisma migrate dev --schema ${schemaPath}`
        //キャッシュ無効化
        prismaClientLib = await import(`${prismaBaseDir}client/index.js?${Date.now()}`)
        await prisma.$disconnect()
        prisma = new prismaClientLib.PrismaClient()
        console.log("Migrated");

    }
    schemaRepository.updateSchema(schema)
    /* const errors = await ModelValidator(models)
    if (errors.length > 0) {
      return c.json(errors, 400)
    }
    const prismaBaseDir = "../../prisma/"
    const schemaPath = `${prismaBaseDir}schema.prisma`
    const writer = Bun.file(schemaPath).writer()
    PrismaSchemaGenerator(models, headerContents, (s) => writer.write(s))
    writer.end()
    await $`bun prisma generate --schema ${schemaPath}` */
    release()
    return c.text('Hello Hono!')
});


export default axApi