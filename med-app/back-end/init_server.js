
const redis = require('redis');
const fs = require('fs');
const {enrollAdminHosp1} = require('./admin-enroll/enroll-admin-hosp1.js');
const {enrollAdminHosp2} = require('./admin-enroll/enroll-admin-hosp2.js');
const {enrollRegisterUser} = require('./register-user');
const {createRedisClient} = require('./utils');


// Enrolls and registers the patients in the initLedger as users.
 
async function initLedger() {
  try {
    const jsonString = fs.readFileSync('../med-chaincode/lib/initLedger.json','utf8');
    const patients = JSON.parse(jsonString);
    for (let i = 0; i < patients.length; i++) {
      const attr = {firstName: patients[i].firstName, lastName: patients[i].lastName, role: 'patient'};
      await enrollRegisterUser('1', 'PID'+i, JSON.stringify(attr));
    }
  } catch (err) {
    console.log(err);
  }
}
// Init the redis db with the admins credentials

async function initRedis() {
  let redisUrl = 'redis://127.0.0.1:6379';
  let redisPassword = 'hosp1';
  let redisClient = redis.createClient(redisUrl);
  redisClient.AUTH(redisPassword);
  redisClient.SET('admin1', redisPassword);
  redisClient.QUIT();

  redisUrl = 'redis://127.0.0.1:6380';
  redisPassword = 'hosp2';
  redisClient = redis.createClient(redisUrl);
  redisClient.AUTH(redisPassword);
  redisClient.SET('admin2', redisPassword);
  console.log('Done');
  redisClient.QUIT();
  return;
}

// Create doctors in both organizations based on the initDoctors JSON
 
async function enrollAndRegisterDoctors() {
  try {
    const jsonString = fs.readFileSync('./initDoctors.json');
    const doctors = JSON.parse(jsonString);
    for (let i = 0; i < doctors.length; i++) {
      const attr = {firstName: doctors[i].firstName, lastName: doctors[i].lastName, role: 'doctor', speciality: doctors[i].speciality};
      // Create a redis client and add the doctor to redis
      doctors[i].hospitalId = parseInt(doctors[i].hospitalId);
      const redisClient = createRedisClient(doctors[i].hospitalId);
      (await redisClient).SET('HOSP' + doctors[i].hospitalId + '-' + 'DOC' + i, 'password');
      await enrollRegisterUser(doctors[i].hospitalId, 'HOSP' + doctors[i].hospitalId + '-' + 'DOC' + i, JSON.stringify(attr));
      (await redisClient).QUIT();
    }
  } catch (error) {
    console.log(error);
  }
};

/* Function to initialise the backend server, enrolls and regsiter the admins and initLedger patients.
   Need not run this manually, included as a prestart in package.json
 */
  async function main()   {
  /*await enrollAdminHosp1();
  await enrollAdminHosp2();
  await initLedger();*/
  await initRedis();
  //await enrollAndRegisterDoctors();
}

main();

