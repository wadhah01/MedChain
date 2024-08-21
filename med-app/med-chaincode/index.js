
'use strict';

const PrimaryContract = require('./lib/primaryContract.js');
const AdminContract = require('./lib/admincc.js');
const PatientContract = require('./lib/patientcc.js');
const DoctorContract = require('./lib/doctorcc.js');

module.exports.contracts = [ PrimaryContract, AdminContract, DoctorContract, PatientContract ];