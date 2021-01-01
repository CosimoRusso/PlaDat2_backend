const r2 = require("r2");
const FormData = require('form-data');
const { update } = require("../../api/companies/company.controller");
const {  Company } = require('../../models').models;
const Sequelize = require('../../models/db');
const signJWT = require("../../utils/signJWT");
const { hash, compare } =require("../../utils/password");
const cleanDatabase = require('../../utils/cleanDatabase.util');
const fs = require("fs");
const http = require("http");
const md5File = require("md5-file");
const fetch = require('node-fetch');
const path = require("path");
const {pipeline} = require("stream");
const {promisify} = require("util");

const noop = () => {};
const sequelize = new Sequelize().getInstance();

// we need a reference to the objects that we put in the database so that we can use them in the tests
const o = {};

// first thing, Fill the database with all the necessary stuff
beforeAll(async () => {
  o.company = await Company.create({email: "change@profilePicture.com", name: "Company Kitten"});
});

afterAll(cleanDatabase.bind(null, o, sequelize));

test("Company can change its profile picture", async () => {
  const { company } = o;
  const jwt = signJWT({id: company.id, userType: "company"});
  const url = "http://localhost:3000/api/v1/company/imageUpload";

  const form = new FormData();
  const kittenPath = path.join(__dirname, "kitten.jpeg");
  form.append("image", fs.createReadStream(kittenPath));
  const res = await fetch(url, { body: form, method: "POST", headers: {"Authorization": "Bearer " + jwt} });

  expect(res.status).toBe(200);
  const json = await res.json();
  await company.reload();
  const picture = json.picture;
  expect(picture).toBeDefined();
  expect(picture).toBe(company.picture);

  const streamPipeline = promisify(pipeline);
  const response = await fetch(picture);
  expect(response.ok).toBe(true);
  const tmpPath = path.join(__dirname, "tmp.jpeg");
  await streamPipeline(response.body, fs.createWriteStream(tmpPath));
  const hash1 = await md5File(tmpPath);
  const hash2 = await md5File(kittenPath);
  expect(hash1).toBe(hash2);
  fs.unlinkSync(tmpPath);
});