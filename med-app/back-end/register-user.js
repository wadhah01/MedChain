
const {Wallets} = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const {buildCAClient, registerAndEnrollUser} = require('../javascript-application/CAUtil.js');
const walletPath = path.join(__dirname, '..','javascript-application','wallet');
const {buildCCPHosp1, buildCCPHosp2, buildWallet, buildCCPHosp3} = require('../javascript-application/AppUtil.js');
let mspOrg;
let adminUserId;
let caClient;

//ccp: common connection profile 
//ca: certificate authority

exports.enrollRegisterUser = async function(hospitalId, userId, attributes) {
  try {
    // setup the wallet to hold the credentials of the application user
    const wallet = await buildWallet(Wallets, walletPath);
    hospitalId = parseInt(hospitalId);
 
    if (hospitalId === 1) {
      // build an in memory object with the network configuration (also known as a connection profile)
      const ccp = buildCCPHosp1();
      affiliation="org1.department1"
      // build an instance of the fabric ca services client based on
      // the information in the network configuration
      caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

      mspOrg = 'Org1MSP';
      adminUserId = 'admin1';
    } else if (hospitalId === 2) {
      // build an in memory object with the network configuration (also known as a connection profile)
      const ccp = buildCCPHosp2();
      affiliation="org1.department2"

      // build an instance of the fabric ca services client based on
      // the information in the network configuration
      caClient = buildCAClient(FabricCAServices, ccp, 'ca.org2.example.com');

      mspOrg = 'Org2MSP';
      adminUserId = 'admin2';
    } 
    // enrolls users to Hospital 1 and adds the user to the wallet
    await registerAndEnrollUser(caClient, wallet, mspOrg, userId, adminUserId, attributes);
    console.log('msg: Successfully enrolled user ' + userId + ' and imported it into the wallet');
  } catch (error) {
    console.error(`Failed to register user "${userId}": ${error}`);
    process.exit(1);
  }
};