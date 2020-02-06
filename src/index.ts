import { Request, Response, NextFunction } from "express";
import {
  HttpMethod,
  HttpProtocol,
  HttpRequestBuilder,
  HttpResponseBuilder,
} from "http-types";

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
  const chunks: Buffer[] = [];

  const request = HttpRequestBuilder.fromPathnameAndQuery({
    headers: req.headers as { string: string | string[] },
    host: req.hostname,
    method: req.method.toUpperCase() as HttpMethod,
    pathname: req.path,
    query: req.query,
    protocol: req.protocol.toUpperCase() as HttpProtocol,
    body: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
  });

  res.on("data", data => {
    chunks.push(Buffer.from(data));
  });

  res.on("finish", () => {
    const body = Buffer.concat(chunks).toString("utf8");

    const response = HttpResponseBuilder.from({
      statusCode: res.statusCode,
      body,
      headers: res.getHeaders() as { string: string | string[] },
    });
    options.writer(JSON.stringify({ request, response }));
  });

  next();
};
