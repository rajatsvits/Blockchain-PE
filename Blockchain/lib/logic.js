/**
 * @param {org.lockerney.main.grantAccess} tx
 * @transaction
 */
function grantsAccess(tx) {
    // var userServicePair = tx.userServicePair;
    // var serviceAccess = tx.userServicePair.serviceAccess;

    // console.log("User Id: "+user.userId);
    // console.log("Service Id: "+service.serviceId);
    // console.log("Name access: "+serviceAccess.name);
    // console.log("DOB access: "+serviceAccess.dateOfBirth);
    // console.log("Social Security No access: "+serviceAccess.socialSecurityNo);
    // console.log("Member Id access: "+serviceAccess.memberIdNo);
    // console.log("Email address access: "+serviceAccess.emailAddress);
    // console.log("Mailing address access: "+serviceAccess.mailingAddress);
    // console.log("Telephone No access: "+serviceAccess.telephoneNo);
    // console.log("Bank Account No access: "+serviceAccess.bankAccNo);
    // console.log("Clinical Info access: "+serviceAccess.clinicalInfo);
    // console.log("Claims Info access: "+serviceAccess.claimsInfo);

    return getAssetRegistry('org.lockerney.main.UserServicePair')
        .then(function(asetRegistry){
            return asetRegistry.update(userServicePair);
        });
}

/**
 * @param {org.lockerney.main.askAccess} tx
 * @transaction
 */
function asksAccess(tx) {
    // var serviceUserPair = tx.serviceUserPair;
    // var serviceAccess = tx.serviceUserPair.serviceAccess;

    //console.log("User Id: "+user.userId);
    //console.log("Service Id: "+service.serviceId);
    // console.log("Name access: "+serviceAccess.name);
    // console.log("DOB access: "+serviceAccess.dateOfBirth);
    // console.log("Social Security No access: "+serviceAccess.socialSecurityNo);
    // console.log("Member Id access: "+serviceAccess.memberIdNo);
    // console.log("Email address access: "+serviceAccess.emailAddress);
    // console.log("Mailing address access: "+serviceAccess.mailingAddress);
    // console.log("Telephone No access: "+serviceAccess.telephoneNo);
    // console.log("Bank Account No access: "+serviceAccess.bankAccNo);
    // console.log("Clinical Info access: "+serviceAccess.clinicalInfo);
    // console.log("Claims Info access: "+serviceAccess.claimsInfo);

    return getAssetRegistry('org.lockerney.main.UserServicePair')
        .then(function(asetRegistry){
            return asetRegistry.update(serviceUserPair);
        });
}


/**
 * @param {org.lockerney.main.updateUser} tx
 * @transaction
 */
function asksAccess(tx) {
    var updateUser = tx.updateUser;
    // var serviceUserPair = tx.serviceUserPair;
    // var serviceAccess = tx.serviceUserPair.serviceAccess;

    //console.log("User Id: "+user.userId);
    //console.log("Service Id: "+service.serviceId);
    // console.log("Name access: "+serviceAccess.name);
    // console.log("DOB access: "+serviceAccess.dateOfBirth);
    // console.log("Social Security No access: "+serviceAccess.socialSecurityNo);
    // console.log("Member Id access: "+serviceAccess.memberIdNo);
    // console.log("Email address access: "+serviceAccess.emailAddress);
    // console.log("Mailing address access: "+serviceAccess.mailingAddress);
    // console.log("Telephone No access: "+serviceAccess.telephoneNo);
    // console.log("Bank Account No access: "+serviceAccess.bankAccNo);
    // console.log("Clinical Info access: "+serviceAccess.clinicalInfo);
    // console.log("Claims Info access: "+serviceAccess.claimsInfo);

    return getAssetRegistry('org.lockerney.main.User')
        .then(function(asetRegistry){
            return asetRegistry.update(updateUser);
        });
}