// Bring common classes into scope, and Fabric SDK network class
const {ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT, capitalize, getMessage, validateRole} = require('../utils.js');
const network = require('../../javascript-application/app.js');


// @description This method retrives an existing patient from the ledger
 
exports.getPatientById = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
  await validateRole([ROLE_DOCTOR, ROLE_PATIENT], userRole, res);
  const patientId = req.params.patientId;
   // Set up and connect to Fabric Gateway
  const networkObj = await network.connectToNetwork(req.headers.username);
  // Invoke the smart contract function
  const response = await network.invoke(networkObj, true, capitalize(userRole) + 'Contract:readPatient', patientId);
  (response.error) ? res.status(400).send(response.error) : res.status(200).send(JSON.parse(response));


};

//  This method updates an existing patient personal details. This method can be executed only by the patient.




exports.getPatientHistoryById = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
  await validateRole([ROLE_DOCTOR, ROLE_PATIENT], userRole, res);
  const patientId = req.params.patientId;
  // Set up and connect to Fabric Gateway
  const networkObj = await network.connectToNetwork(req.headers.username);
  // Invoke the smart contract function
  const response = await network.invoke(networkObj, true, capitalize(userRole) + 'Contract:getPatientHistory', patientId);
  const parsedResponse = await JSON.parse(response);
  (response.error) ? res.status(400).send(response.error) : res.status(200).send(parsedResponse);}




exports.getDoctorsByHospitalId = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
  await validateRole([ROLE_PATIENT, ROLE_ADMIN], userRole, res);
  const hospitalId = parseInt(req.params.hospitalId);
  // Set up and connect to Fabric Gateway
  userId = hospitalId === 1 ? 'admin1' : hospitalId === 2 ? 'admin2' :'';
  const networkObj = await network.connectToNetwork(userId);
  // Use the gateway and identity service to get all users enrolled by the CA
  const response = await network.getAllDoctorsByHospitalId(networkObj, hospitalId);
  (response.error) ? res.status(500).send(response.error) : res.status(200).send(response);
};

exports.grantAccessToDoctor = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
 // await validateRole([ROLE_PATIENT], userRole, res);
  const patientId = req.params.patientId;
  const doctorId = req.params.doctorId;
  let args = {patientId: patientId, doctorId: doctorId};
  args= [JSON.stringify(args)];
  // Set up and connect to Fabric Gateway
  const networkObj = await network.connectToNetwork(req.headers.username);
  // Invoke the smart contract function
  const response = await network.invoke(networkObj, false, capitalize(userRole) + 'Contract:grantAccessToDoctor', args);
  (response.error) ? res.status(500).send(response.error) : res.status(200).send(getMessage(false, `Access granted to ${doctorId}`));
};

exports.revokeAccessFromDoctor = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
  await validateRole([ROLE_PATIENT], userRole, res);
  const patientId = req.params.patientId;
  const doctorId = req.params.doctorId;
  let args = {patientId: patientId, doctorId: doctorId};
  args= [JSON.stringify(args)];
  // Set up and connect to Fabric Gateway
  const networkObj = await network.connectToNetwork(req.headers.username);
  // Invoke the smart contract function
  const response = await network.invoke(networkObj, false, capitalize(userRole) + 'Contract:revokeAccessFromDoctor', args);
  (response.error) ? res.status(500).send(response.error) : res.status(200).send(getMessage(false, `Access revoked from ${doctorId}`));
};