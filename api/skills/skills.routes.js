'use strict';

const controller = require('./skills.controller');

module.exports = Router => {
  const router = new Router({
    prefix: `/skills`,
  });

  router
    .get('/getOne/:skillId', controller.getOne)
    .get('/', controller.getAll)
    .post('/', controller.createOne);

  return router;
};
