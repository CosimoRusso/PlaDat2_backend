'use strict';

const controller = require('./student.controller');
const { authentication, studentAuthentication } = require("../../middleware/authentication");


module.exports = Router => {
  const router = new Router({
    prefix: `/student`,
  });

  router
    .get('/', controller.getAll)
    .post('/', controller.createOne)
    .get('/findOne/:userId', controller.getOne)
    .get('/findByEmail/:email', controller.getOneByEmail)
    .post('/login', controller.login)
    .post('/register', controller.register)
    .use(authentication)
    .use(studentAuthentication)
    .get('/applications', controller.getApplications)
    .post('/jobs/apply/:jobId', controller.apply)
    .post('/jobs/discard/:jobId', controller.discard)
    .get('/jobs/search', controller.searchJobs)
    .post('/profile',controller.update)
    .post('/removeCapability',controller.removeCapability)
    .post('/addCapability',controller.addCapability)
    // .post('/imageUpload',controller.imageUpload)

  return router;
};
