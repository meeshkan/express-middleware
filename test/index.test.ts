import fs from "fs";
import express from "express";
import request from "supertest";
import middleware from "../src";

test("file is written to correct path with correctly formatted content", async () => {
  const app = express();
  app.use(
    middleware({
      writer: (chunk: string) =>
        fs.appendFileSync("foo.jsonl", chunk + "\n")
    })
  );
  app.get("/foo", (req, res) => res.send("Hello World!"));
  app.get("/bar", (req, res) => res.json({ hello: "world" }));
  await request(app).get("/foo");
  await request(app).get("/bar");
  const info = fs
    .readFileSync("foo.jsonl")
    .toString()
    .split("\n")
    .filter(i => i !== "")
    .map(i => JSON.parse(i));
  expect(info[0].response.statusCode).toBe(200);
  expect(info[0].request.path).toBe("/foo");
  expect(info[1].request.path).toBe("/bar");
});
