/* istanbul ignore file */
const { hash } = require("./password");
const countrieslist = require("../data/countries.json");
const { Op } = require("sequelize");
let skills = require("../data/skills");
let skillCategories = require("../data/categories");
const { env } = require("../config");
const all_cities = require('all-the-cities')
function getSkill(name){
  return skills.find(s => s.name === name);
}
function getSkillCategory(name){
  return skillCategories.find(s => s.name === name);
}
module.exports = async (models) => {
  
  const { Application, City, Company, Country, Job, SkillCategory, Matching, Skill, Student, SkillSetReq, SkillSetOpt, StudentSkill, LevelDescription } = models;
  const randomSkill = await Skill.findOne();
  if (randomSkill) return false; // there are already skills in the db. Don't add them
  
  //builds the skillcategories and the level descriptions
  var skillCategoriesArray = [];

  Object.keys(skillCategories).forEach(x => skillCategoriesArray.push({name: x, description: skillCategories[x]["description"]})) //creates an array of the form {name: nameOfCategoryskill, description: "..."} 
  
  await SkillCategory.bulkCreate(skillCategoriesArray); //puts the instances of categories into the db
  var levelDescriptionArray = [];
  //adds the leveldescriptions to the database  
  for (let x of Object.keys(skillCategories)){
    for (let level of Object.keys(skillCategories[x]["levels"])){
      levelDescriptionArray.push({level: parseInt(level), description: skillCategories[x]["levels"][level], SkillCategoryId: (await SkillCategory.findOne({where: {name: x}})).id})
    }
  }
  await LevelDescription.bulkCreate(levelDescriptionArray) 

  skillCategories = await SkillCategory.findAll(); 
  
  await Skill.bulkCreate(skills.map(s => {
    s.SkillCategoryId = getSkillCategory(s.category).id;
    return s;
  })); 

  let categoriesWithoutSkills = await SkillCategory.findAll({include: [{model: Skill}]});
  categoriesWithoutSkills = categoriesWithoutSkills.filter(c => c.Skills.length === 0);
  for (let c of categoriesWithoutSkills){
    await Skill.create({name: c.name, SkillCategoryId: c.id});
  }

  skills = await Skill.findAll();

  await Promise.all(countrieslist.map(c => Country.create({name: c.name, code: c["alpha-2"]})));

  const countries = await Country.findAll();
  await City.bulkCreate(all_cities.filter(city=>city.population > 65000).map(city => { //the limit of 65000 is due to the limitations of the free version of our deployment platform 
    let countryId = countries.find(country => country.code === city.country).id;
    return {
      name: city.name,
      CountryId: countryId,
      lat: city.loc.coordinates[0],
      long: city.loc.coordinates[1],
    }
  })); 
  if (env !== "production") return false; // if in local just add skills, countries and cities

  const milan = await City.findOne({where: {name: "Milan"}}, { include: [{ model: Country, as: "Country", where: {name: "Italy"} }] });
  const vasteras = await City.findOne({where: {name: "Västerås"}}, { include: [{ model: Country, as: "Country", where: {name: "Sweden"} }] });
  



  //from here on the code is generated by the script

  const pwd = await hash("s3cr3t");
  const LilyPage = await Student.create({firstName: "Lily", lastName: "Page", email: "Lily@Page.com", password: pwd, dateOfBirth: "1999-11-19", CityId: milan.id});
  await StudentSkill.create({ StudentId: LilyPage.id, SkillId: getSkill("C#").id, rating: 4});
  await StudentSkill.create({ StudentId: LilyPage.id, SkillId: getSkill("X++").id , rating: 2});
  await StudentSkill.create({ StudentId: LilyPage.id, SkillId: getSkill("Zebra").id, rating: 3 });
  await StudentSkill.create({ StudentId: LilyPage.id, SkillId: getSkill("ReactJS").id, rating: 5 });
  await StudentSkill.create({ StudentId: LilyPage.id, SkillId: getSkill("Angular").id, rating: 1 });
  await StudentSkill.create({ StudentId: LilyPage.id, SkillId: getSkill("ExpressJS").id, rating: 4 });

const GeorgeJones = await Student.create({firstName: "George", lastName: "Jones", email: "George@Jones.com", password: pwd, dateOfBirth: "1998-09-03", CityId: vasteras.id});
  await StudentSkill.create({ StudentId: GeorgeJones.id, SkillId: getSkill("Swift").id, rating: 2 });
  await StudentSkill.create({ StudentId: GeorgeJones.id, SkillId: getSkill("Latex").id, rating: 3 });
  await StudentSkill.create({ StudentId: GeorgeJones.id, SkillId: getSkill("F#").id , rating: 4});
  await StudentSkill.create({ StudentId: GeorgeJones.id, SkillId: getSkill("PHP").id, rating: 5 });
  await StudentSkill.create({ StudentId: GeorgeJones.id, SkillId: getSkill("Javascript").id, rating: 4 });
  await StudentSkill.create({ StudentId: GeorgeJones.id, SkillId: getSkill("Yii").id, rating: 3 });
  
const TheoPage = await Student.create({firstName: "Theo", lastName: "Page", email: "Theo@Page.com", password: pwd, dateOfBirth: "1999-05-14", CityId: milan.id});
  await StudentSkill.create({ StudentId: TheoPage.id, SkillId: getSkill("Swift").id, rating: 4 });
  await StudentSkill.create({ StudentId: TheoPage.id, SkillId: getSkill("X++").id, rating: 5 });
  await StudentSkill.create({ StudentId: TheoPage.id, SkillId: getSkill("C#").id, rating: 1 });
  await StudentSkill.create({ StudentId: TheoPage.id, SkillId: getSkill("Bootstrap").id, rating: 3 });
  await StudentSkill.create({ StudentId: TheoPage.id, SkillId: getSkill("Javascript").id, rating: 4 });
  await StudentSkill.create({ StudentId: TheoPage.id, SkillId: getSkill("NodeJS").id, rating: 1 });
  
const EmilyJones = await Student.create({firstName: "Emily", lastName: "Jones", email: "Emily@Jones.com", password: pwd, dateOfBirth: "2000-10-09", CityId: vasteras.id});
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("HTML").id, rating: 2 });
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("Swift").id, rating: 4 });
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("Go").id, rating: 5 });
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("X++").id, rating: 2 });
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("Yii").id, rating: 4 });
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("Angular").id, rating: 4 });
  await StudentSkill.create({ StudentId: EmilyJones.id, SkillId: getSkill("ExpressJS").id, rating: 3 });
  
const EmilyBonham = await Student.create({firstName: "Emily", lastName: "Bonham", email: "Emily@Bonham.com", password: pwd, dateOfBirth: "2001-02-23", CityId: milan.id});
  await StudentSkill.create({ StudentId: EmilyBonham.id, SkillId: getSkill("Go").id, rating: 4 });
  await StudentSkill.create({ StudentId: EmilyBonham.id, SkillId: getSkill("F#").id , rating: 3});
  await StudentSkill.create({ StudentId: EmilyBonham.id, SkillId: getSkill("Latex").id , rating: 2});
  await StudentSkill.create({ StudentId: EmilyBonham.id, SkillId: getSkill("Bootstrap").id, rating: 4 });
  await StudentSkill.create({ StudentId: EmilyBonham.id, SkillId: getSkill("Yii").id , rating: 4});
  await StudentSkill.create({ StudentId: EmilyBonham.id, SkillId: getSkill("PHP").id, rating: 3 });
  
const RosiePlant = await Student.create({firstName: "Rosie", lastName: "Plant", email: "Rosie@Plant.com", password: pwd, dateOfBirth: "2000-05-07", CityId: vasteras.id});
  await StudentSkill.create({ StudentId: RosiePlant.id, SkillId: getSkill("Swift").id, rating: 4 });
  await StudentSkill.create({ StudentId: RosiePlant.id, SkillId: getSkill("Latex").id , rating: 2});
  await StudentSkill.create({ StudentId: RosiePlant.id, SkillId: getSkill("Koa").id, rating: 4 });
  await StudentSkill.create({ StudentId: RosiePlant.id, SkillId: getSkill("Bootstrap").id, rating: 3 });
  await StudentSkill.create({ StudentId: RosiePlant.id, SkillId: getSkill("Yii").id, rating: 4 });
  
const OscarBonham = await Student.create({firstName: "Oscar", lastName: "Bonham", email: "Oscar@Bonham.com", password: pwd, dateOfBirth: "1999-12-27", CityId: milan.id, description: 'Passionate about music, I\'m studying a lot of instruments'});
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("C#").id, rating: 4 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("Koa").id, rating: 1 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("IBM\ Watson").id, rating: 3 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("Sequelize").id, rating: 4 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("Docker").id, rating: 5 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("Wordpress").id, rating: 4 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("Bootstrap").id, rating: 4 });
  await StudentSkill.create({ StudentId: OscarBonham.id, SkillId: getSkill("MySQL").id, rating: 3 });

const WillowPlant = await Student.create({firstName: "Willow", lastName: "Plant", email: "Willow@Plant.com", password: pwd, dateOfBirth: "2001-07-02", CityId: vasteras.id});
  await StudentSkill.create({ StudentId: WillowPlant.id, SkillId: getSkill("Latex").id, rating: 3 });
  await StudentSkill.create({ StudentId: WillowPlant.id, SkillId: getSkill("TypeScript").id, rating: 4 });
  await StudentSkill.create({ StudentId: WillowPlant.id, SkillId: getSkill("UnderscoreJS").id, rating: 3 });
  await StudentSkill.create({ StudentId: WillowPlant.id, SkillId: getSkill("IBM\ Watson").id, rating: 2 });
  await StudentSkill.create({ StudentId: WillowPlant.id, SkillId: getSkill("PHP").id , rating: 1});
  await StudentSkill.create({ StudentId: WillowPlant.id, SkillId: getSkill("ExpressJS").id, rating: 4 });

const RosiePage = await Student.create({firstName: "Rosie", lastName: "Page", email: "Rosie@Page.com", password: pwd, dateOfBirth: "1999-08-08", CityId: milan.id});
  await StudentSkill.create({ StudentId: RosiePage.id, SkillId: getSkill("UnderscoreJS").id, rating: 5 });
  await StudentSkill.create({ StudentId: RosiePage.id, SkillId: getSkill("Latex").id, rating: 2 });
  await StudentSkill.create({ StudentId: RosiePage.id, SkillId: getSkill("Swift").id, rating: 4 });
  await StudentSkill.create({ StudentId: RosiePage.id, SkillId: getSkill("ExpressJS").id, rating: 4 });
  await StudentSkill.create({ StudentId: RosiePage.id, SkillId: getSkill("NodeJS").id, rating: 3 });
  await StudentSkill.create({ StudentId: RosiePage.id, SkillId: getSkill("PHP").id, rating: 4 });
  
const JacobJones = await Student.create({firstName: "Jacob", lastName: "Jones", email: "Jacob@Jones.com", password: pwd, dateOfBirth: "2000-03-13", CityId: vasteras.id});
  await StudentSkill.create({ StudentId: JacobJones.id, SkillId: getSkill("Zebra").id, rating: 1 });
  await StudentSkill.create({ StudentId: JacobJones.id, SkillId: getSkill("UnderscoreJS").id, rating: 4 });
  await StudentSkill.create({ StudentId: JacobJones.id, SkillId: getSkill("IBM\ Watson").id, rating: 5 });
  await StudentSkill.create({ StudentId: JacobJones.id, SkillId: getSkill("Docker").id, rating: 3 });
  await StudentSkill.create({ StudentId: JacobJones.id, SkillId: getSkill("MongoDB").id, rating: 4 });
  await StudentSkill.create({ StudentId: JacobJones.id, SkillId: getSkill("MySQL").id, rating: 5 });
  

//BUILD BUSINESSES
  const microsoft = await Company.create({name: "Microsoft", description: "A company that does computers", CityId: milan.id, email: "microsoft@pladat.tk", password: pwd});
  const apple = await Company.create({name: "Apple", description: "A company that does computers that cost too much", CityId: vasteras.id, email: "apple@apple.com", password: pwd});
  const google = await Company.create({name: "Google", description: "A company that likes your data quite a lot", CityId: vasteras.id, email: "google@gmail.com", password: pwd});
  const ibm = await Company.create({name: "IBM", description: "A company that is in this field since before the field was born", CityId: milan.id, email: "ibm@ibm.com", password: pwd});
  
//BUILD JOBS
  const DeveloperJobMicrosoft = await Job.create({name: "DeveloperJobMicrosoft", description: "Developer job at Microsoft. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at Microsoft, if the internship turns out to be successful ", CompanyId: microsoft.id, timeLimit: new Date("2022-05-01"), salary: 400, partTime: true, remote: false, CityId: milan.id});
  await SkillSetReq.create({JobId: DeveloperJobMicrosoft.id, SkillId: getSkill("Javascript").id});
  await SkillSetOpt.create({JobId: DeveloperJobMicrosoft.id, SkillId: getSkill("UnderscoreJS").id});
  await SkillSetOpt.create({JobId: DeveloperJobMicrosoft.id, SkillId: getSkill("HTML").id});

  const DatabaseJobMicrosoft = await Job.create({name: "DatabaseJobMicrosoft", description: "Database job at Microsoft. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at Microsoft, if the internship turns out to be successful ", CompanyId: microsoft.id, timeLimit: new Date("2022-02-16"), salary: 500, partTime: true, remote: true, CityId: milan.id});
  await SkillSetReq.create({JobId: DatabaseJobMicrosoft.id, SkillId: getSkill("Javascript").id});
  await SkillSetOpt.create({JobId: DatabaseJobMicrosoft.id, SkillId: getSkill("Zebra").id});
  await SkillSetOpt.create({JobId: DatabaseJobMicrosoft.id, SkillId: getSkill("IBM\ Watson").id});
  
  const DeveloperJobApple = await Job.create({name: "DeveloperJobApple", description: "Developer job at Apple. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at Apple, if the internship turns out to be successful ", CompanyId: apple.id, timeLimit: new Date("2022-07-10"), salary: 1000, partTime: false, remote: false, CityId: vasteras.id});
  await SkillSetReq.create({JobId: DeveloperJobApple.id, SkillId: getSkill("Javascript").id});
  await SkillSetOpt.create({JobId: DeveloperJobApple.id, SkillId: getSkill("ReactJS").id});
  await SkillSetOpt.create({JobId: DeveloperJobApple.id, SkillId: getSkill("UnderscoreJS").id});
  await SkillSetOpt.create({JobId: DeveloperJobApple.id, SkillId: getSkill("Swift").id});
  
  const DatabaseJobApple = await Job.create({name: "DatabaseJobApple", description: "Database job at Apple. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at Apple, if the internship turns out to be successful ", CompanyId: apple.id, timeLimit: new Date("2022-07-27"), salary: 500, partTime: true, remote: true, CityId: vasteras.id});
  await SkillSetReq.create({JobId: DatabaseJobApple.id, SkillId: getSkill("Wordpress").id});
  await SkillSetOpt.create({JobId: DatabaseJobApple.id, SkillId: getSkill("F#").id});
  await SkillSetOpt.create({JobId: DatabaseJobApple.id, SkillId: getSkill("Go").id});
  await SkillSetOpt.create({JobId: DatabaseJobApple.id, SkillId: getSkill("X++").id});
  
  const DeveloperJobGoogle = await Job.create({name: "DeveloperJobGoogle", description: "Developer job at Google. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at Google, if the internship turns out to be successful ", CompanyId: google.id, timeLimit: new Date("2022-11-27"), salary: 700, partTime: false, remote: true, CityId: vasteras.id});
  await SkillSetReq.create({JobId: DeveloperJobGoogle.id, SkillId: getSkill("Javascript").id});
  await SkillSetOpt.create({JobId: DeveloperJobGoogle.id, SkillId: getSkill("HTML").id});
  await SkillSetOpt.create({JobId: DeveloperJobGoogle.id, SkillId: getSkill("UnderscoreJS").id});
  await SkillSetOpt.create({JobId: DeveloperJobGoogle.id, SkillId: getSkill("Zebra").id});
  
  const DatabaseJobGoogle = await Job.create({name: "DatabaseJobGoogle", description: "Database job at Google. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at Google, if the internship turns out to be successful ", CompanyId: google.id, timeLimit: new Date("2022-08-06"), salary: 200, partTime: true, remote: true, CityId: vasteras.id});
  await SkillSetReq.create({JobId: DatabaseJobGoogle.id, SkillId: getSkill("MySQL").id});
  await SkillSetOpt.create({JobId: DatabaseJobGoogle.id, SkillId: getSkill("X++").id});
  await SkillSetOpt.create({JobId: DatabaseJobGoogle.id, SkillId: getSkill("Koa").id});
  await SkillSetOpt.create({JobId: DatabaseJobGoogle.id, SkillId: getSkill("Zebra").id});
  
  const DeveloperJobIBM = await Job.create({name: "DeveloperJobIBM", description: "Developer job at IBM. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at IBM, if the internship turns out to be successful ", CompanyId: ibm.id, timeLimit: new Date("2022-07-21"), salary: 800, partTime: false, remote: true, CityId: milan.id});
  await SkillSetReq.create({JobId: DeveloperJobIBM.id, SkillId: getSkill("Bootstrap").id});
  await SkillSetOpt.create({JobId: DeveloperJobIBM.id, SkillId: getSkill("C#").id});
  await SkillSetOpt.create({JobId: DeveloperJobIBM.id, SkillId: getSkill("IBM\ Watson").id});
  await SkillSetOpt.create({JobId: DeveloperJobIBM.id, SkillId: getSkill("Go").id});
  
  const DatabaseJobIBM = await Job.create({name: "DatabaseJobIBM", description: "Database job at IBM. We are searching for skilled students to help them grow in their professional field. They must have a proactive attitude and should be very motivate to work here, as even the internship workload is hard to sustain. This position offers the possibility of getting a position here at IBM, if the internship turns out to be successful ", CompanyId: ibm.id, timeLimit: new Date("2022-08-06"), salary: 700, partTime: true, remote: true, CityId: milan.id});
  await SkillSetReq.create({JobId: DatabaseJobIBM.id, SkillId: getSkill("Wordpress").id});
  await SkillSetOpt.create({JobId: DatabaseJobIBM.id, SkillId: getSkill("Zebra").id});
  await SkillSetOpt.create({JobId: DatabaseJobIBM.id, SkillId: getSkill("Latex").id});
  await SkillSetOpt.create({JobId: DatabaseJobIBM.id, SkillId: getSkill("F#").id});
  
  
//BUILD MATCHING + APPLICATIONS
  await Matching.create({StudentId: GeorgeJones.id, JobId: DeveloperJobMicrosoft.id, discarded: true});
  
  await Matching.create({StudentId: EmilyJones.id, JobId: DeveloperJobMicrosoft.id, discarded: true});
  
  await Matching.create({StudentId: EmilyBonham.id, JobId: DeveloperJobMicrosoft.id, discarded: true});
  
  await Matching.create({StudentId: RosiePlant.id, JobId: DeveloperJobMicrosoft.id, discarded: false});
  await Application.create({StudentId: RosiePlant.id, JobId: DeveloperJobMicrosoft.id, declined: false});
  
  await Matching.create({StudentId: OscarBonham.id, JobId: DatabaseJobMicrosoft.id, discarded: false});
  await Application.create({StudentId: OscarBonham.id, JobId: DatabaseJobMicrosoft.id, declined: false, alreadyNotified: false});
  await Application.create({StudentId: OscarBonham.id, JobId: DeveloperJobApple.id, declined: true, alreadyNotified: false});
  await Application.create({StudentId: OscarBonham.id, JobId: DeveloperJobGoogle.id, declined: null});

  await Matching.create({StudentId: JacobJones.id, JobId: DatabaseJobMicrosoft.id, discarded: true});
  
  await Matching.create({StudentId: GeorgeJones.id, JobId: DeveloperJobApple.id, discarded: false});
  await Application.create({StudentId: GeorgeJones.id, JobId: DeveloperJobApple.id, declined: false, alreadyNotified: false});
  
  await Matching.create({StudentId: TheoPage.id, JobId: DeveloperJobApple.id, discarded: true});
  
  await Matching.create({StudentId: GeorgeJones.id, JobId: DeveloperJobGoogle.id, discarded: true});
  
  await Matching.create({StudentId: TheoPage.id, JobId: DeveloperJobGoogle.id, discarded: false});
  await Application.create({StudentId: TheoPage.id, JobId: DeveloperJobGoogle.id, declined: null, alreadyNotified: false});
  
  await Matching.create({StudentId: JacobJones.id, JobId: DatabaseJobGoogle.id, discarded: false});
  await Application.create({StudentId: JacobJones.id, JobId: DatabaseJobGoogle.id, declined: true, alreadyNotified: false});
  
  await Matching.create({StudentId: TheoPage.id, JobId: DeveloperJobIBM.id, discarded: true});
  
  await Matching.create({StudentId: EmilyBonham.id, JobId: DeveloperJobIBM.id, discarded: false});
  await Application.create({StudentId: EmilyBonham.id, JobId: DeveloperJobIBM.id, declined: false, alreadyNotified: false});
  
  await Matching.create({StudentId: RosiePlant.id, JobId: DeveloperJobIBM.id, discarded: false});
  await Application.create({StudentId: RosiePlant.id, JobId: DeveloperJobIBM.id, declined: true, alreadyNotified: false});
  
  }