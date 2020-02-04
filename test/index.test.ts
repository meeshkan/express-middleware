import fs from "fs";
import express from "express";
import request from "supertest";
import middleware from "../src";

test("file is written to correct path with correctly formatted content", async () => {
	const app = express();
	app.use(middleware({ path: "foo.txt" }));
	app.get("/foo", (req, res) => res.send("Hello World!"));
	app.get("/bar", (req, res) => res.json({hello: "world"}));
  await request(app).get("/foo");
  await request(app).get("/bar");
});
