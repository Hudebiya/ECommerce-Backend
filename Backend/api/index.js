import app from "../src/app.js";
import connectDB from "../src/db/db.js";

let connectionPromise;

export default async function handler(req, res) {
  if (!connectionPromise) {
    connectionPromise = connectDB();
  }

  await connectionPromise;
  return app(req, res);
}
