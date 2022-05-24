import {describe, expect, test} from "@jest/globals"
import {app, server} from "../../../src"
import request, {Response} from "supertest"
import {getContext} from "../../../src/db/prisma.client"

afterAll(done => {
  getContext().prisma.$disconnect()
  server.close(() => done())
})

describe("Test the policies endpoint", () => {
  test("It should response the GET method", done => {
    request(app)
      .get("/policies")
      .then((response: Response) => {
        expect(response.statusCode).toBe(200)
        done()
      })
  })
})
