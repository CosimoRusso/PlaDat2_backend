'use strict';

const fs = require('fs');
const path = require('path');
const Router = require('koa-router');
const swagger = require('swagger2');
const { ui } = require('swagger2-koa');
const sequelize = require('../models/db');

const swaggerDocument = swagger.loadDocumentSync('./swagger.yml');

const { apiVersion } = require('../config').server;
const baseName = path.basename(__filename);

function applyApiMiddleware(app) {
  const router = new Router({
    prefix: `/api/${apiVersion}`,
  });

  // Require all the folders and create a sub-router for each feature api
  fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== baseName)
    .forEach(file => {
      const api = require(path.join(__dirname, file))(Router);
      router.use(api.routes());
    });
  app.use(ui(swaggerDocument, '/swagger'));
  app.use(router.routes()).use(router.allowedMethods());

  router.get('/', async ctx => {
    console.dir(sequelize);
    ctx.body = JSON.stringify(sequelize);
  });
}

module.exports = applyApiMiddleware;
