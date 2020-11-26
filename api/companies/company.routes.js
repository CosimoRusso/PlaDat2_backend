'use strict';

const controller = require('./company.controller');
const { authentication, companyAuthentication } = require("../../middleware/authentication");

module.exports = Router => {
  const router = new Router({
    prefix: `/company`,
  });

  router
    .post('/login', controller.login)
    .use(authentication) //from now on, only authenticated requests!
    .use(companyAuthentication) //from now on, only authenticated companies
    .post('/jobs/:jobId/accept/:studentId', controller.companyAcceptStudent)
    .get('/candidateStudents/:jobId', controller.getCandidatesForJob)
  return router;
};
