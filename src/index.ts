import { Request, Response, NextFunction } from "express";
import expressWinston from "express-winston";
import winston from "winston";
interface Options {
  path: string;
}

// TODO: express only exposes getHeaders, so no way to get them as a property
// how can we get the headers?

export default (options: Options) =>
  expressWinston.logger({
    transports: [new winston.transports.File({ filename: options.path })],
    format: winston.format.json(),
    requestWhitelist:  ['url', 'headers', 'method', 'httpVersion', 'originalUrl', 'query'],
    responseWhitelist: ['statusCode', 'body'],
  });
