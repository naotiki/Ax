import { $ } from "bun";
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { ModelValidator, PrismaSchemaGenerator, type ModelType } from 'lib'
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
let oldModels: ModelType[] = []
app.get("/diff",async (c)=>{
  const models = await c.req.json<ModelType[]>()
  const result = diff([], models, )
  return c.json(result)
})
app.post('/migrate', async (c) => {
  const models = await c.req.json<ModelType[]>()
  const r = diff(oldModels,models,)
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
  port: 8080,
  fetch: app.fetch,
} 
