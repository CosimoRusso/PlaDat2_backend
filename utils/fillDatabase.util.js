const { hash } = require("./password");
const countrieslist = require("../data/countries.json");
let skills = require("../data/skills");
const { env } = require("../config");

const cities = [
    {name: "Milan", country: "IT", lat: "45.46427", lng: "9.18951"},
    {name: "Västerås", country: "SE", lat: "59.61617", lng: "16.55276"},
  ];

module.exports = async (models) => {
  const { Application, City, Company, Country, Job, JobCategory, Matching, Skill, Student, SkillSetReq, SkillSetOpt, StudentSkill } = models;
  const randomSkill = await Skill.findOne();
  if (randomSkill) return false; // there are already skills in the db. Don't add them

  await Skill.bulkCreate(skills);
  skills = await Skill.findAll();

  await Promise.all(countrieslist.map(c => Country.create({name: c.name, code: c["alpha-2"]})));

  const countries = await Country.findAll();
  await City.bulkCreate(cities.map(city => {
    let countryId = countries.find(country => country.code === city.country).id;
    countryId = countryId.id;
    return {
      name: city.name,
      CountryId: countryId,
      lat: city.lat,
      long: city.lng,
    }
  }));

  if (env !== "PRODUCTION") return false; // if in local just add skills, countries and cities

  const pwd = await hash("s3cr3t");
  const leonardo = await Student.create({firstName: "Leonardo", lastName: "Da Vinci", email:"leonardo@davinci.com", password: pwd, dateOfBirth: "1997-04-15"});
  await StudentSkill.create({ StudentId: leonardo.id, SkillId: getSkill("C#").id });
  await StudentSkill.create({ StudentId: leonardo.id, SkillId: getSkill("HTML").id });
  await StudentSkill.create({ StudentId: leonardo.id, SkillId: getSkill("MySQL").id });
  await StudentSkill.create({ StudentId: leonardo.id, SkillId: getSkill("MongoDB").id });

  const michelangelo = await Student.create({firstName: "Michelangelo", lastName: "Buonarroti", email:"michelangelo@buonarroti.com", password: pwd, dateOfBirth: "1998-03-06"});
  await StudentSkill.create({ StudentId: michelangelo.id, SkillId: getSkill("Swift").id });
  await StudentSkill.create({ StudentId: michelangelo.id, SkillId: getSkill("MySQL").id });
  await StudentSkill.create({ StudentId: michelangelo.id, SkillId: getSkill("HTML").id });

  const raffaello = await Student.create({firstName: "Raffaello", lastName: "Sanzio", email:"raffaello@Sanzio.com", password: pwd, dateOfBirth: "1993-03-22"});
  await StudentSkill.create({ StudentId: raffaello.id, SkillId: getSkill("Swift").id });
  await StudentSkill.create({ StudentId: raffaello.id, SkillId: getSkill("Sequelize").id });
  await StudentSkill.create({ StudentId: raffaello.id, SkillId: getSkill("MySQL").id });
  await StudentSkill.create({ StudentId: raffaello.id, SkillId: getSkill("MongoDB").id });

  const donatello = await Student.create({firstName: "Donatello", lastName: "di Niccolò", email:"donatello@dinico.com", password: pwd, dateOfBirth: "1997-03-02"});
  await StudentSkill.create({ StudentId: donatello.id, SkillId: getSkill("Koa").id });
  await StudentSkill.create({ StudentId: donatello.id, SkillId: getSkill("Latex").id });
  await StudentSkill.create({ StudentId: donatello.id, SkillId: getSkill("MongoDB").id });

  const dante = await Student.create({firstName: "Dante", lastName: "Alighieri", email:"dante@guelfibianchi.com", password: pwd, dateOfBirth: "2000-10-15"});
  await StudentSkill.create({ StudentId: dante.id, SkillId: getSkill("NodeJS").id });
  await StudentSkill.create({ StudentId: dante.id, SkillId: getSkill("Wordpress").id });
  await StudentSkill.create({ StudentId: dante.id, SkillId: getSkill("MySQL").id });


  const milan = await City.findOne({where: {name: "Milan"}}, { include: [{ model: Country, as: "Country", where: {name: "Italy"} }] });
  const vasteras = await City.findOne({where: {name: "Västerås"}}, { include: [{ model: Country, as: "Country", where: {name: "Sweden"} }] });
  const microsoft = await Company.create({name: "Microsoft", description: "A company that does computers", CItyId: milan.id, email: "microsoft@outlook.com", password: pwd});
  const apple = await Company.create({name: "Apple", description: "A company that does computers that cost too much", CItyId: vasteras.id, email: "apple@apple.com", password: pwd});
  const google = await Company.create({name: "Google", description: "A company that likes your data quite a lot", CItyId: vasteras.id, email: "google@gmail.com", password: pwd});

  const devJobMicrosoft = await Job.create({name: "Developer", description: "Looking for a developer", CompanyId: microsoft.id});
  await SkillSetReq.create({JobId: devJobMicrosoft.id, SkillId: getSkill("C#").id});
  await SkillSetOpt.create({JobId: devJobMicrosoft.id, SkillId: getSkill("HTML").id});

  const devJobApple = await Job.create({name: "Developer", description: "Looking for a developer", CompanyId: apple.id});
  await SkillSetReq.create({JobId: devJobApple.id, SkillId: getSkill("Swift").id});
  await SkillSetOpt.create({JobId: devJobApple.id, SkillId: getSkill("HTML").id});

  const databaseJobMicrosoft = await Job.create({name: "Database expert", description: "Looking for a student with relational DB passion", CompanyId: microsoft.id});
  await SkillSetReq.create({JobId: databaseJobMicrosoft.id, SkillId: getSkill("MySQL").id});
  await SkillSetOpt.create({JobId: databaseJobMicrosoft.id, SkillId: getSkill("MongoDB").id});
  
  const databaseJobApple = await Job.create({name: "Database expert", description: "Looking for a student with relational DB passion", CompanyId: apple.id});
  await SkillSetReq.create({JobId: databaseJobApple.id, SkillId: getSkill("MySQL").id});
  await SkillSetOpt.create({JobId: databaseJobApple.id, SkillId: getSkill("Sequelize").id});

  const devJobGoogle = await Job.create({name: "Junior Developer", description: "Looking for a student with passion for technology and willingness to work hard", CompanyId: google.id});
  await SkillSetReq.create({JobId: devJobGoogle.id, SkillId: getSkill("MySQL").id});
  await SkillSetReq.create({JobId: devJobGoogle.id, SkillId: getSkill("HTML").id});
  await SkillSetOpt.create({JobId: devJobGoogle.id, SkillId: getSkill("Sequelize").id});

  const dataEngineerJobGoogle = await Job.create({name: "Data Engineer", description: "Looking for a student with passion for data and willingness to work hard", CompanyId: google.id});
  await SkillSetReq.create({JobId: dataEngineerJobGoogle.id, SkillId: getSkill("MySQL").id});
  await SkillSetReq.create({JobId: dataEngineerJobGoogle.id, SkillId: getSkill("Go").id});
  await SkillSetOpt.create({JobId: dataEngineerJobGoogle.id, SkillId: getSkill("Sequelize").id});

  const databaseJobGoogle = await Job.create({name: "Database expert", description: "Looking for a student great with MySQL", CompanyId: google.id});
  await SkillSetReq.create({JobId: databaseJobGoogle.id, SkillId: getSkill("MySQL").id});
  await SkillSetOpt.create({JobId: databaseJobGoogle.id, SkillId: getSkill("MongoDB").id});
  await SkillSetOpt.create({JobId: databaseJobGoogle.id, SkillId: getSkill("NodeJS").id});

  /*
  Job -> requesteskills               -> who can do the job (of course not everyone gets matched for everything)
  DevjobMicrosoft -> c#               -> leonardo
  devJobApple -> swift                -> michelangelo, raffaello
  databaseJobMIcrosoft -> mySQL 			->all except donatello
  databaseJobApple -> MySQL 					->all except donatello
  devJobGoogle -> MySQL, HTML					->michelangelo
  dataEngineerJobGoogle -> MySql, Go 	->no one
  databaseJobGoogle -> mySQL 					->all except donatello
  */

  //Leonardo applies for a job at Microsoft but gets declined
  const leonardoApplication = await Application.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, declined: true});
  const leonardoDiscardedMatch = await Matching.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, discarded: false});
  //Leonardo applies for a db job at Microsoft and is still wait
  await Matching.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, discarded: false});
  await Application.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, declined: null});
  //Leonardo applies for a db job at Apple and is accepted
  await Matching.create({StudentId: leonardo.id, JobId: databaseJobApple.id, discarded: false});
  await Application.create({StudentId: leonardo.id, JobId: databaseJobApple.id, declined: false});
  //Michelangelo applies for a job at Apple and is waiting for a reply
  await Application.create({StudentId: michelangelo.id, JobId: devJobApple.id});
  await Matching.create({StudentId: michelangelo.id, JobId: devJobApple.id, discarded: false});

  await Application.create({StudentId: michelangelo.id, JobId: databaseJobApple.id, declined: true});
  await Matching.create({StudentId: michelangelo.id, JobId: databaseJobApple.id, discarded: false});
  
  await Matching.create({StudentId: raffaello.id, JobId: devJobApple.id, discarded: false});
  await Application.create({StudentId: raffaello.id, JobId: devJobApple.id, declined: true});
  //Dante was waiting for the job at google but got hired at microsoft
  await Matching.create({StudentId: dante.id, JobId: databaseJobGoogle.id, discarded: false});
  await Application.create({StudentId: dante.id, JobId: databaseJobGoogle.id, declined: null});

  await Matching.create({StudentId: dante.id, JobId: databaseJobMicrosoft.id, discarded: false});
  await Application.create({StudentId: dante.id, JobId: databaseJobMicrosoft.id, declined: false});

  //await Application.create({StudentId: michelangelo.id, JobId: devJobMicrosoft.id, declined: false});
  //await Application.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, declined: true}); //what
}

function getSkill(name){
  return skills.find(s => s.name === name);
}
