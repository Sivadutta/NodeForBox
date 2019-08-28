var BoxSDK = require('box-node-sdk');
var jsonConfig = require('');//Your configfile.json  goes here....
var sdk = BoxSDK.getPreconfiguredInstance(jsonConfig);
var Excel = require('exceljs');
var serviceAccountClient = sdk.getAppAuthClient('enterprise', '33673038');
var log4js = require( "log4js" );
log4js.configure( "./config/log4jsconfig.json" );
var logger = log4js.getLogger( "file" );

var usersList = [];
serviceAccountClient._useIterators = true;

//To update multiple user 
//Read from excel sheet

var wb = new Excel.Workbook();
var path = require('path');
var filePath = path.resolve(__dirname, './BoxUsers.xlsx');
wb.xlsx.readFile(filePath).then(function () {
  var sh = wb.getWorksheet("Users");
  //Get all the rows data [1st column]
  for (i = 2; i <= sh.rowCount; i++) {
    callBoxFunction(sh.getRow(i).getCell(1).value);
  }
});

function updateUserInBox(userID) {
  return new Promise(function (user, err) {
    serviceAccountClient.users.get(userID, {
        fields: 'id,name,login,status'
      })
      .then(function (user) {
        processData(user);
      })
      .catch(err => logger.error('Error for user id: ' + userID, err));
  });
}

function processData(user) {
  var resultStatus = JSON.stringify(user.status.toLowerCase().trim());  
  serviceAccountClient.users.update(user.id, {
    status: 'Inactive'
    })
    .then(user => logger.info('Status Changed for ', user.id, user.status))
    .catch(err => logger.error('Got an error! for user id: ' + user.id, err));  
}

async function callBoxFunction(userID) {  
  let response = "";
  response = await updateUserInBox(userID);  
  logger.info("After await",response);
}