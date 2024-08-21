
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//const jwtSecretToken = 'password';
//const refreshSecretToken = 'refreshpassword';
let refreshTokens = [];



// Bring key classes into scope
const patientRoutes = require('./routes/patient-routes');
const doctorRoutes = require('./routes/doctor-routes.js');
const adminRoutes = require('./routes/admin-routes');
const {ROLE_DOCTOR, ROLE_ADMIN, ROLE_PATIENT, CHANGE_TMP_PASSWORD} = require('./utils');
const {createRedisClient, capitalize, getMessage} = require('./utils');
const network = require('../javascript-application/app.js');

// Express Application init
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());


/*const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (token === '' || token === 'null') {
      return res.status(401).send('Unauthorized request: Token is missing');
    }
    jwt.verify(token, jwtSecretToken, (err, user) => {
      if (err) {
        return res.status(403).send('Unauthorized request: Wrong or expired token found');
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).send('Unauthorized request: Token is missing');
  }
};*/

// Generates a new accessToken
 
//function generateAccessToken(username, role) {
  //return jwt.sign({username: username, role: role}, jwtSecretToken, {expiresIn: '5m'});
//}

// Login and create a session with and add two variables to the session

app.post('/login', async (req, res) => {
  // Read username and password from request body
  let {username, password, hospitalId, role} = req.body;
  hospitalId = parseInt(hospitalId);
  let user;
  // using get instead of redis GET for async
  if (role === ROLE_DOCTOR || role === ROLE_ADMIN) {
    // Create a redis client based on the hospital ID
    const redisClient = await createRedisClient(hospitalId);
    // Async get
    const value = await redisClient.get(username);
    // comparing passwords
    user = value === password;
    redisClient.quit();
    console.log(`${role} connected sucessfuly `);
    res.send(`${role} connected sucessfuly `);
  }

  if (role === ROLE_PATIENT) {
    const networkObj = await network.connectToNetwork(username);
    const newPassword = req.body.newPassword;

    if (newPassword === null || newPassword === '') {
      const value = crypto.createHash('sha256').update(password).digest('hex');
      const response = await network.invoke(networkObj, true, capitalize(role) + 'Contract:getPatientPassword', username);
      if (response.error) {
        res.status(400).send(response.error);
      } else {
        const parsedResponse = await JSON.parse(response);
        if (parsedResponse.password.toString('utf8') === value) {
          (!parsedResponse.pwdTemp) ?
            user = true :
            res.status(200).send(getMessage(false, CHANGE_TMP_PASSWORD));
        }
      }
    } else {
      let args = ({
        patientId: username,
        newPassword: newPassword,
      });
      args = [JSON.stringify(args)];
      const response = await network.invoke(networkObj, false, capitalize(role) + 'Contract:updatePatientPassword', args);
      (response.error) ? res.status(500).send(response.error) : user = true;
    }
  }

  /*if (user) {
    // Generate an access token
    const accessToken = generateAccessToken(username, role);
    const refreshToken = jwt.sign({username: username, role: role}, refreshSecretToken);
    refreshTokens.push(refreshToken);
    // Once the password is matched a session is created with the username and password
    res.status(200);
    res.json({
      accessToken,
      refreshToken,
    });
  } else {
    res.status(400).send({error: 'Username or password incorrect!'});
  }*/
});

//Creates a new accessToken when refreshToken is passed in post request
 
/*app.post('/token', (req, res) => {
  const {token} = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  jwt.verify(token, refreshSecretToken, (err, username) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = generateAccessToken({username: username, role: req.headers.role});
    res.json({
      accessToken,
    });
  });
});

// Logout to remove refreshTokens
 
/*app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.headers.token);
  res.sendStatus(204);
});*/

//Admin Routes /////
app.post('/doctors/register',  adminRoutes.createDoctor);
app.get('/patients/_all',  adminRoutes.getAllPatients);
app.post('/patients/register',  adminRoutes.createPatient);

//  Doctor Routes /////
app.patch('/patients/:patientId/details/medical',  doctorRoutes.updatePatientMedicalDetails);
app.get('/doctors/:hospitalId([0-9]+)/:doctorId(HOSP[0-9]+\-DOC[0-9]+)',  doctorRoutes.getDoctorById);
//app.get('/doctors/:doctorId(HOSP[0-9]+\-DOC[0-9]+)/:patientId',  doctorRoutes.readPatient);
//  Patient Routes /////
app.get('/patients/:patientId', patientRoutes.getPatientById);
app.get('/patients/:patientId/history',  patientRoutes.getPatientHistoryById);
app.get('/doctors/:hospitalId([0-9]+)/_all',  patientRoutes.getDoctorsByHospitalId);
app.patch('/patients/:patientId/grant/:doctorId',  patientRoutes.grantAccessToDoctor);
app.patch('/patients/:patientId/revoke/:doctorId',  patientRoutes.revokeAccessFromDoctor);

app.listen(3001, () => console.log('Backend server running on 3001'));