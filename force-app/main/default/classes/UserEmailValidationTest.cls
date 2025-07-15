@isTest
public class UserEmailValidationTest {

    @isTest
    public static void validateTest(){
        Id userId = UserInfo.getUserId();
        
        Test.startTest();
            UserEmailValidation.validate(userId); 
        Test.stopTest();
    }
}