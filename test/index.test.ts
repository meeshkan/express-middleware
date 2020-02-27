import fs from "fs";
import express from "express";
import { HttpExchangeReader, HttpExchange, HttpMethod } from "http-types";
import request from "supertest";
import middleware, { LocalFileSystemTransport } from "../src";

const TEST_JSONL = "foo.jsonl";

const readExchanges = (jsonlFilename: string): HttpExchange[] => {
  const jsonlStr = fs.readFileSync(jsonlFilename, { encoding: "utf-8" });
  const exchanges: HttpExchange[] = [];
  HttpExchangeReader.fromJsonLines(jsonlStr, exchange => exchanges.push(exchange));
  return exchanges;
};

describe("middleware", () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_JSONL)) {
      fs.unlinkSync(TEST_JSONL);
    }
  });
  test("writes to correct path with correctly formatted content", async () => {
    const app = express();

    app.use(
      middleware({
        transports: [LocalFileSystemTransport(TEST_JSONL)],
      })
    );
    app.get("/foo", (_, res) => res.send("Hello World!"));
    app.get("/bar", (_, res) => res.json({ hello: "world" }));

    await request(app).get("/foo?a=b&q=1&q=2");
    await request(app).get("/bar");

    const exchanges = readExchanges(TEST_JSONL);
    expect(exchanges).toHaveLength(2);

    const firstExchange = exchanges[0];
    expect(firstExchange.response.statusCode).toBe(200);
    expect(firstExchange.response.body).toBe("Hello World!");

    expect(firstExchange.request.path).toBe("/foo?a=b&q=1&q=2");
    expect(firstExchange.request.pathname).toBe("/foo");
    expect(firstExchange.request.headers.get("connection")).toEqual("close");
    expect(firstExchange.request.query.get("a")).toEqual("b");
    expect(firstExchange.request.query.getAll("q")).toEqual(["1", "2"]);
    expect(firstExchange.request.method).toBe(HttpMethod.GET);

    expect(exchanges[1].request.path).toBe("/bar");
  });
  test("does not change the response", async () => {
    const app = express();

    app.use(
      middleware({
        transports: [],
      })
    );
    app.get("/bar", (_, res) => res.json({ hello: "world" }));

    await request(app)
      .get("/bar")
      .expect(200, {
        hello: "world",
      });
  });
  test("correctly writes the path at routes", async () => {
    const app = express();

    const exchanges: HttpExchange[] = [];

    const transport = (exchange: HttpExchange) => {
      exchanges.push(exchange);
      return Promise.resolve();
    };

    app.use(
      middleware({
        transports: [transport],
      })
    );

    const route = express.Router();
    route.get("/bar", (_, res) => res.json({ hello: "world" }));

    app.use("/route", route);

    await request(app).get("/route/bar?q=a");

    expect(exchanges).toHaveLength(1);

    const exchange = exchanges[0];

    expect(exchange.request.pathname).toBe("/route/bar");
    expect(exchange.request.path).toBe("/route/bar?q=a");
    expect(exchange.request.query.toJSON()).toEqual({ q: "a" });
  });
});
