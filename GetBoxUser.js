var BoxSDK = require('box-node-sdk');
var jsonConfig = require('');//Your configfile.json  goes here....
var sdk = BoxSDK.getPreconfiguredInstance(jsonConfig);
var Excel = require('exceljs');
var serviceAccountClient = sdk.getAppAuthClient('enterprise');
var resultFile = './BoxUsersSheet.csv';
getAllUsersFromBox();


function getSingleUserInfoFromBox()
{
    serviceAccountClient.users.get('', {fields: 'id,name,login,status'})
        .then(function(user){
            console.log('Got user info ', user.name);   
            processData(user);
        })
        .catch(err => console.log('Got an error!', err));      
}
function processData(user){    
    serviceAccountClient.users.update(user.id, {
        status: 'Inactive'
      })
      .then(user => console.log('Status Changed for ', user.id, user.status))
      .catch(err => console.log('Got an error! for user id: ' + user.id, err));
}
    
 //Get all users from Box  
serviceAccountClient._useIterators = true; 
function getAllUsersFromBox(){  
        var workbook = new Excel.Workbook();        
        var sheet = workbook.addWorksheet('Users');
        sheet.columns = [{key:"id", header:"id"}, {key: "login", header: "login"}];      
            
        var usersList = [];  
        var rows =[];  
        serviceAccountClient.enterprise.getUsers({ limit: 1000 })
        .then((usersIterator) => {
            return autoPage(usersIterator);
        })
        .then((collection) => {        
             collection.forEach(function(user) {  
          rows = [user.id,user.name,user.login];
          sheet.addRow(rows).commit();
           }, this);
           workbook.xlsx.writeFile(resultFile);
        });
    }
    function autoPage(iterator) {
      let collection = [];
      let moveToNextItem = () => {
          return iterator.next()
              .then((item) => {
                  if (item.value) {
                      collection.push(item.value);
                  }
                  if (item.done !== true) {
                      return moveToNextItem();
                  } else {
                      return collection;
                  }
              })
      }
      return moveToNextItem();
    }