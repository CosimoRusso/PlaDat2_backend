'use strict';

const http = require('http');
const server = require('./server');
const { Sequelize } = require('sequelize');

const env = process.env;
let sequelize = null;
if (env.DATABASE_URL) {
  sequelize = new Sequelize(env.DATABASE_URL);
} else {
  sequelize = new Sequelize(env.DB_DATABASE, env.DB_USER, env.DB_PASSWORD, { host: env.DB_HOST, dialect: 'postgres', });
}

const { port } = require('./config').server;

async function bootstrap() {
  /**
   * Add external services init as async operations (db, redis, etc...)
   * e.g.
   * await sequelize.authenticate()
   */

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  return http.createServer(server.callback()).listen(port);
}

bootstrap()
  .then(server =>
    console.log(`🚀 Server listening on port ${server.address().port}!`),
  )
  .catch(err => {
    setImmediate(() => {
      console.error('Unable to run the server because of the following error:');
      console.error(err);
      process.exit();
    });
  });
