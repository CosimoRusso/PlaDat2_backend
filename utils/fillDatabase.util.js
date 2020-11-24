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
  await StudentSkill.create({ StudentId: michelangelo.id, SkillId: getSkill("HTML").id });



  const milan = await City.findOne({where: {name: "Milan"}}, { include: [{ model: Country, as: "Country", where: {name: "Italy"} }] });
  const vasteras = await City.findOne({where: {name: "Västerås"}}, { include: [{ model: Country, as: "Country", where: {name: "Sweden"} }] });
  const microsoft = await Company.create({name: "Microsoft", description: "A company that does computers", CItyId: milan.id, email: "microsoft@outlook.com", password: pwd});
  const apple = await Company.create({name: "Apple", description: "A company that does computers that cost too much", CItyId: vasteras.id, email: "apple@apple.com", password: pwd});

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

  const leonardoApplication = await Application.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id});
  const leonardoDiscardedMatch = await Matching.create({StudentId: leonardo.id, JobId: devJobApple.id, discarded: true});

  const michelangeloAcceptedApplication = await Application.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, declined: false});
  const michelangeloDeclinedApplication = await Application.create({StudentId: leonardo.id, JobId: devJobMicrosoft.id, declined: true});
}

function getSkill(name){
  return skills.find(s => s.name === name);
}