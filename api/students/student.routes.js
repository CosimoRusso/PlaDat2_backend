'use strict';

const controller = require('./student.controller');
const { authentication, studentAuthentication } = require("../../middleware/authentication");

module.exports = Router => {
  const router = new Router({
    prefix: `/student`,
  });

  router
    .post('/login', controller.login)
    .use(authentication)
    .use(studentAuthentication)
    .get('/applications', controller.getApplications)
    .get('/:userId', controller.getOne)
    .get('/', controller.getAll)
    .post('/', controller.createOne)
    .post('/jobs/apply/:jobId', controller.apply);

  return router;
};
