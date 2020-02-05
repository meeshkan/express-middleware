import fs from "fs";
import express from "express";
import request from "supertest";
import middleware from "../src";

test("file is written to correct path with correctly formatted content", async () => {
  if (fs.existsSync("foo.jsonl")) {
    fs.unlinkSync("foo.jsonl");
  }

  const app = express();
  app.use(
    middleware({
      writer: (chunk: string) => fs.appendFileSync("foo.jsonl", chunk + "\n")
    })
  );
  app.get("/foo", (req, res) => res.send("Hello World!"));
  app.get("/bar", (req, res) => res.json({ hello: "world" }));
  await request(app).get("/foo?a=b&q=1&q=2");
  await request(app).get("/bar");
  const info = fs
    .readFileSync("foo.jsonl")
    .toString()
    .split("\n")
    .filter(i => i !== "")
    .map(i => JSON.parse(i));
  expect(info[0].response.statusCode).toBe(200);
  expect(info[0].request.path).toBe("/foo?a=b&q=1&q=2");
  expect(info[0].request.pathname).toBe("/foo");
  expect(info[0].request.headers["connection"]).toEqual("close");
  expect(info[0].request.query["a"]).toEqual("b");
  expect(info[0].request.query["q"]).toEqual(["1", "2"]);
  expect(info[1].request.path).toBe("/bar");
});
