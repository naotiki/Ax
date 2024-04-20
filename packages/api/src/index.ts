import { Hono } from 'hono'
import axApi from "./ax";
const app = new Hono().basePath("/api")
app.route("/ax",axApi)
//app.use(cors())
app.get("/a", async (c) => {
  return c.text('Hello Hono!')
})



Bun.serve({
  hostname:"0.0.0.0",
  port:7001,
  fetch: app.fetch,
})