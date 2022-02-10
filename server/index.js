require("dotenv").config();
const express = require("express");
const app = express();

const path = require("path");

const Rollbar = require("rollbar");
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

app.use(express.json());
app.use(express.static("public"));

const cities = [
  "Portland",
  "Wellington",
  "Auckland",
  "Christchurch",
  "Phoenix",
];

app.get("/", (req, res) => {
  console.log("Yellow");
  rollbar.log("Yellow: hit on server!");

  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/cities", (req, res) => {
  rollbar.info("Someone got cities!");
  res.status(200).send(cities);
});

app.post("/api/cities", (req, res) => {
  rollbar.info("Someone sent a city!");
  const { name } = req.body;

  cities.unshift(name);

  res.status(200).send(cities);
});

app.delete("/api/cities/:idx", (req, res) => {
  if (req.params.idx === "0") {
    rollbar.error("Someone tried to delete 1st city!");
    return res.status(403).send(cities);
  }
  rollbar.info(`Someone deleted ${cities[+req.params.idx]}`);
  cities.splice(+req.params.idx, 1);

  res.status(200).send(cities);
});

app.get("/error", (req, res) => {
  console.log("Error Hit");
  rollbar.critical("Error Hit");
  try {
    nonExistentFunction();
  } catch (error) {
    console.error(error);
    //   // expected output: ReferenceError: nonExistentFunction is not defined
    //   // Note - error messages will vary depending on browser
  }
  res.sendStatus(404);
  return;
});

const port = process.env.PORT || process.env.SERVER_PORT;

app.listen(port, () => console.log(`Server running on ${port}`));
