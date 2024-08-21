// Bring common classes into scope, and Fabric SDK network class
const {ROLE_DOCTOR, capitalize, getMessage, validateRole} = require('../utils.js');
const network = require('../../javascript-application/app.js');


/*
   req Body must be a json, role in the header and patientId in the url
  res A 200 response if patient is updated successfully else a 500 response with s simple message json
 description:Updates an existing asset(patient medical details) in the ledger. This method can be executed only by the doctor.
 */
exports.updatePatientMedicalDetails = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
  await validateRole([ROLE_DOCTOR], userRole, res);
  let args = req.body;
  args.patientId = req.params.patientId;
  args.changedBy = req.headers.username;
  args= [JSON.stringify(args)];
  // Set up and connect to Fabric Gateway
  const networkObj = await network.connectToNetwork(req.headers.username);
  // Invoke the smart contract function
  const response = await network.invoke(networkObj, false, capitalize(userRole) + 'Contract:updatePatientMedicalDetails', args);
  (response.error) ? res.status(500).send(response.error) : res.status(200).send(getMessage(false, 'Successfully Updated Patient.'));
};

// This method retrives an existing doctor

exports.getDoctorById = async (req, res) => {
  // User role from the request header is validated
  const userRole = req.headers.role;
  await validateRole([ROLE_DOCTOR], userRole, res);
  const hospitalId = parseInt(req.params.hospitalId);
  // Set up and connect to Fabric Gateway
  const userId = hospitalId === 1 ? 'admin1' :  'admin2' ;
  const doctorId = req.params.doctorId;
  const networkObj = await network.connectToNetwork(userId);
  // Use the gateway and identity service to get all users enrolled by the CA
  const response = await network.getAllDoctorsByHospitalId(networkObj, hospitalId);
  // Filter the result using the doctorId
  (response.error) ? res.status(500).send(response.error) : res.status(200).send(response.filter(
    function(response) {
      return response.id === doctorId;
    },
  )[0]);
};

/*exports.readPatient= async (req,res)=>{
  const userRole = req.headers.role;
  patientId=req.params.patientId;
  await validateRole([ROLE_DOCTOR], userRole, res);
  // Set up and connect to Fabric Gateway
  const doctorId = req.params.doctorId;
  const networkObj = await network.connectToNetwork(patientId);
  // const response = await network.invoke(networkObj, false, userRole + 'Contract:readPatient', patientId);
  // Use the gateway and identity service to get all users enrolled by the CA
  const response = await network.readPatient(networkObj, patientId);
  // Filter the result using the doctorId
  (response.error) ? res.status(400).send("no access granted") : res.status(200).send(response);
}*/