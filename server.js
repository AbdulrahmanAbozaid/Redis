const express = require("express");
const app = express();
require("dotenv").config();
const Redis = require("redis");
const redisClient = Redis.createClient();
const EXPIRY = 3600;
redisClient.connect();

app.get("/posts", async (req, res) => {
  const posts = await SetOrGetCashe("posts", async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data;
  });
  res.status(200).json({ msg: "success", posts });
});

/// Helpers
function SetOrGetCashe(key, cb) {
  return new Promise(async (resolve, reject) => {
    const data = await redisClient.get(key);
    if (data != null) resolve(JSON.parse(data));
    const dataCashe = await cb();
    redisClient.setEx(key, EXPIRY, JSON.stringify(dataCashe));
    resolve(dataCashe);
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
