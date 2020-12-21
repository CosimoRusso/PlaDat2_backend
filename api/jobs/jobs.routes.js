'use strict';

const controller = require('./jobs.controller');

module.exports = Router => {
  const router = new Router({
    prefix: `/jobs`,
  });

  router
    .get('/findOne/:jobId', controller.getOne)
    .get('/', controller.getAll)
    .post('/', controller.createOne)
    .post('/update', controller.update);
  return router;
};
