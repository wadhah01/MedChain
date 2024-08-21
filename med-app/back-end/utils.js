const redis = require('redis');
const util = require('util');

exports.ROLE_ADMIN = 'admin';
exports.ROLE_DOCTOR = 'doctor';
exports.ROLE_PATIENT = 'patient';

exports.CHANGE_TMP_PASSWORD = 'CHANGE_TMP_PASSWORD';


exports.getMessage = function(isError, message, id = '', password = '') {
  if (isError) {
    return {error: message};
  } else {
    return {success: message, id: id, password: password};
  }
};

/*
    The roles delimited by | against which the validation needs to be done
  reqRole The role to be validated
   res 401 is reqRole is not present n roles
Validation of the role ,example roles - 'patient|doctor' reqRole - 'admin' returns 401
 */
exports.validateRole = async function(roles, reqRole, res) {
  if (!reqRole || !roles || reqRole.length === 0 || roles.length === 0 || !roles.includes(reqRole)) {
    // user's role is not authorized
    return res.sendStatus(401).json({message: 'Unauthorized Role'});
  }
};

/*
  s Any string
  First letter capitalized string
  Capitalizes the first letter of the string
 */
exports.capitalize = function(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Creates a redis client based on the hospitalID and allows promisify methods using util
 
exports.createRedisClient = async function(hospitalId) {
  // TODO: Handle using config file
  let redisPassword;
  if (hospitalId === 1) {
    redisUrl = 'redis://127.0.0.1:6379';
    redisPassword = 'hosp1';
  } else if (hospitalId === 2) {
    redisUrl = 'redis://127.0.0.1:6380';
    redisPassword = 'hosp2';
  } 
  const redisClient = redis.createClient(redisUrl);
  redisClient.AUTH(redisPassword);
  // NOTE: Node Redis currently doesn't natively support promises
  // Util node package to promisify the get function of the client redis
  redisClient.get = util.promisify(redisClient.get);
  return redisClient;
};