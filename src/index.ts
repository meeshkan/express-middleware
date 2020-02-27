import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import { HttpMethod, HttpProtocol, HttpRequestBuilder, HttpResponseBuilder, HttpExchange } from "http-types";

export type HttpExchangeTransport = (httpExchange: HttpExchange) => Promise<void>;

export interface Options {
  transports?: HttpExchangeTransport[];
}

type WriteCb = (error: Error | null | undefined) => void;
type EndCb = () => void;

export const LocalFileSystemTransport = (filename: string): HttpExchangeTransport => (httpExchange: HttpExchange) =>
  new Promise((resolve, reject) => {
    try {
      fs.appendFileSync(filename, JSON.stringify(httpExchange) + "\n");
      resolve();
    } catch (err) {
      reject(err);
    }
  });

export default (options: Options) => async (req: Request, res: Response, next: NextFunction) => {
  const oldWrite = res.write;
  const oldEnd = res.end;

  const transports = options.transports || [];

  const chunks: Buffer[] = [];

  res.write = (thingOne: any, thingTwo?: string | WriteCb, thingThree?: WriteCb) => {
    chunks.push(Buffer.from(thingOne));
    return oldWrite.apply(res, [
      thingOne,
      typeof thingTwo === "string" ? thingTwo : "utf8",
      thingThree === undefined && thingTwo !== undefined && typeof thingTwo !== "string" ? thingTwo : thingThree,
    ]);
  };

  res.end = (thingOne: any, thingTwo?: string | EndCb, thingThree?: EndCb) => {
    if (thingOne) {
      chunks.push(Buffer.from(thingOne));
    }
    const body = Buffer.concat(chunks).toString("utf8");

    const fullPath = req.originalUrl;

    const request = HttpRequestBuilder.fromPath({
      headers: req.headers as { string: string | string[] },
      host: req.hostname,
      method: req.method.toLowerCase() as HttpMethod,
      path: req.originalUrl,
      protocol: req.protocol.toLowerCase() as HttpProtocol,
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
    });

    const response = HttpResponseBuilder.from({
      statusCode: res.statusCode,
      body,
      headers: res.getHeaders() as { string: string | string[] },
    });

    const exchange: HttpExchange = { request, response };

    transports.forEach(async transport => {
      await transport(exchange);
    });

    return oldEnd.apply(res, [
      thingOne,
      typeof thingTwo === "string" ? thingTwo : "utf8",
      thingThree === undefined && thingTwo !== undefined && typeof thingTwo !== "string" ? thingTwo : thingThree,
    ]);
  };

  next();
};
