import { $ } from "bun";
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ModelValidator, PrismaSchemaGenerator, type ModelType } from 'ax'
import { createBunWebSocket } from "hono/bun";
import { diff, flattenChangeset } from 'json-diff-ts';
const app = new Hono()
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
app.use(cors())
const dataDir = "../../.axcel/"
const schemaFile=Bun.file(`${dataDir}schema.json`)
app.get("/api/ax/schema", async (c) => {
  if (await schemaFile.exists()) {
    return c.json<ModelType[]>(await schemaFile.json())
  }
  return c.json<ModelType[]>([])
})

app.get("/api/ax/diff", async (c) => {
  const models = await c.req.json<ModelType[]>()
  const result = diff([], models,)
  return c.json(result)
});

app.post('/api/ax/migrate', async (c) => {
  const models = await c.req.json<ModelType[]>()
  const r = diff(oldModels, models,)
  oldModels = models
  return c.json(flattenChangeset(r))
  const errors = await ModelValidator(models)
  if (errors.length > 0) {
    return c.json(errors, 400)
  }
  const prismaBaseDir = "../../prisma/"
  const schemaPath = `${prismaBaseDir}schema.prisma`
  const writer = Bun.file(schemaPath).writer()
  PrismaSchemaGenerator(models, headerContents, (s) => writer.write(s))
  writer.end()
  await $`bun prisma generate --schema ${schemaPath}`
  return c.text('Hello Hono!')
});



export default {
  port: 7001,
  fetch: app.fetch,
}