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
    .post('/update', controller.update)
    .get('/update/:jobId/removeReq/:skillId', controller.removeRequiredSkill)
    .get('/update/:jobId/addReq/:skillId', controller.AddRequiredSkill)
    .get('/update/:jobId/removeOpt/:skillId', controller.removeOptionalSkill)
    .get('/update/:jobId/addOpt/:skillId', controller.AddOptionalSkill);
  return router;
};
