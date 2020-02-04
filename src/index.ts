import { Request, Response, NextFunction } from "express";
import fs from "fs";
import {
  ISerializedRequest,
  ISerializedResponse,
  HTTPMethod,
  IProtocol
} from "unmock-types";
import url from "url";
interface Options {
  writer: (s: string) => void;
}

type WriteCb = (error: Error | null | undefined) => void;
type EndCb = () => void;

export default (options: Options) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const oldWrite = res.write;
  const oldEnd = res.end;

  const chunks: Buffer[] = [];

  res.write = (
    thingOne: any,
    thingTwo?: string | WriteCb,
    thingThree?: WriteCb
  ) => {
    chunks.push(Buffer.from(thingOne));
    return oldWrite.apply(res, [
      thingOne,
      typeof thingTwo === "string" ? thingTwo : "utf8",
      thingThree === undefined &&
      thingTwo !== undefined &&
      typeof thingTwo !== "string"
        ? thingTwo
        : thingThree
    ]);
  };

  res.end = (thingOne: any, thingTwo?: string | EndCb, thingThree?: EndCb) => {
    if (thingOne) {
      chunks.push(Buffer.from(thingOne));
    }
    const body = Buffer.concat(chunks).toString("utf8");

    const output: {
      request: ISerializedRequest;
      response: ISerializedResponse;
    } = {
      request: {
        headers: req.headers,
        host: req.hostname,
        method: req.method as HTTPMethod,
        path: url.parse(req.url).path || req.path,
        pathname: url.parse(req.url).pathname || req.path,
        query: req.query,
        protocol: req.protocol as IProtocol,
        body: typeof req.body === "string" ? req.body : JSON.stringify(req.body)
      },
      response: {
        statusCode: res.statusCode,
        body,
        headers: res.getHeaders()
      }
    };
    options.writer(JSON.stringify(output));
    return oldEnd.apply(res, [
      thingOne,
      typeof thingTwo === "string" ? thingTwo : "utf8",
      thingThree === undefined &&
      thingTwo !== undefined &&
      typeof thingTwo !== "string"
        ? thingTwo
        : thingThree
    ]);
  };

  next();
};
