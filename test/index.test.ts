import fs from "fs";
import express from "express";
import { HttpExchangeReader, HttpExchange } from "http-types";
import request from "supertest";
import middleware from "../src";

const TEST_JSONL = "foo.jsonl";

beforeEach(() => {
  if (fs.existsSync(TEST_JSONL)) {
    fs.unlinkSync(TEST_JSONL);
  }
});

const readExchanges = (jsonlFilename: string): HttpExchange[] => {
  const jsonlStr = fs.readFileSync(jsonlFilename, { encoding: "utf-8" });
  const exchanges: HttpExchange[] = [];
  HttpExchangeReader.fromJsonLines(jsonlStr, exchange => exchanges.push(exchange));
  return exchanges;
};

test("file is written to correct path with correctly formatted content", async () => {
  const app = express();

  app.use(
    middleware({
      writer: (chunk: string) => fs.appendFileSync(TEST_JSONL, chunk + "\n"),
    })
  );
  app.get("/foo", (_, res) => res.send("Hello World!"));
  app.get("/bar", (_, res) => res.json({ hello: "world" }));

  await request(app).get("/foo?a=b&q=1&q=2");
  await request(app).get("/bar");

  const exchanges = readExchanges(TEST_JSONL);

  expect(exchanges).toHaveLength(2);
  expect(exchanges[0].response.statusCode).toBe(200);
  expect(exchanges[0].request.path).toBe("/foo?a=b&q=1&q=2");
  expect(exchanges[0].request.pathname).toBe("/foo");
  expect(exchanges[0].request.headers.get("connection")).toEqual("close");
  expect(exchanges[0].request.query.get("a")).toEqual("b");
  expect(exchanges[0].request.query.getAll("q")).toEqual(["1", "2"]);
  expect(exchanges[1].request.path).toBe("/bar");
});
