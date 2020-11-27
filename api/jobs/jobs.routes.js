'use strict';

const controller = require('./jobs.controller');

module.exports = Router => {
  const router = new Router({
    prefix: `/jobs`,
  });

  router
    .get('/:jobId', controller.getOne)
    .get('/', controller.getAll)
    .post('/', controller.createOne);

  return router;
};
