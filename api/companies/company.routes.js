'use strict';

const controller = require('./company.controller');

module.exports = Router => {
  const router = new Router({
    prefix: `/company`,
  });

  router
    .post('/:companyId/jobs/:jobId/accept/:studentId', controller.companyAcceptStudent)

  return router;
};
