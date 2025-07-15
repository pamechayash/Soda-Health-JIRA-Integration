@RestResource(urlMapping='/EmailValidation/*')
global with sharing class UserEmailValidation {

    @HttpPost
    global static Boolean validate(String userId) {
        String startUrl = '/s/EmailVerification';
        
        Boolean success = System.UserManagement.sendAsyncEmailConfirmation(userId, null, null, startUrl);

        return success;
    }    
}