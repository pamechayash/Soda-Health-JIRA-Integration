/**
 * @description       : 
 * @author            : rob.rastovich
 * @group             : 
 * @last modified on  : 07-23-2025
 * @last modified by  : rob.rastovich
**/
public with sharing class JiraSyncService {
    @AuraEnabled(cacheable=true)
    public static Case getCaseData(Id caseId) {
        try {
            System.debug('case id => ' + caseId);
            return [
                SELECT Id, Subject, Comments, Priority, Status, Owner.Name,Harmony_ID__c,Account.Short_code__c
                FROM Case
                WHERE Id = :caseId
                LIMIT 1
            ];
        } catch(Exception e) {
            throw new AuraHandledException('Error fetching case details: ' + e.getMessage());
        }
    }

  @AuraEnabled
public static Map<String, Object> createJiraIssue(Map<String, Object> formData) {
    return sendCaseToZapier(formData);
}

   public static Map<String, Object> sendCaseToZapier(Map<String, Object> formData) {
    Map<String, Object> result = new Map<String, Object>{
        'statusCode' => null,
        'body' => ''
    };

    try {
        Id caseId = (Id) formData.get('caseId');
        Case c = [SELECT Id, Subject, Comments, Priority, Status,Harmony_ID__c, Account.Short_code__c, Description FROM Case WHERE Id = :caseId LIMIT 1];
      String sponsorShortCode;
        if (c.Account != null && String.isNotBlank(c.Account.Short_code__c)) {
            sponsorShortCode = c.Account.Short_code__c; 
        } else {
            sponsorShortCode = (String) formData.get('sponsor'); 
        }
       Map<String, Object> payload = new Map<String, Object>{
               'caseId'           => c.Id,
               'summary'          => c.Subject,
               'priority'         => c.Priority,
               'status'           => c.Status,
               'comments'         => c.Comments,
               'issueType'        => (String)formData.get('issueType'),
               'benefits'         => (List<Object>)formData.get('benefits'),
               'outboundCall'     => formData.get('outboundCall'),
               'harmonyId'        => formData.get('harmonyId'),
               'sponsor'          => sponsorShortCode,
               'benefirExtensionReason'  => formData.get('benefirExtensionReason'),
               'expediteReason'   => formData.get('expediteReason'),
               'additionalDetails'=> formData.get('additionalDetails'),
               'caseOwner'       => formData.get('caseOwner'),
               'description'     => c.Description,
                'whatIsTheIssue' =>formData.get('whatIsTheIssue'),
               'ExpediteRequest.addressVerification' => formData.get('ExpediteRequest.addressVerification'),
                'ExpediteRequest.temporaryAddress' =>formData.get('ExpediteRequest.temporaryAddress'),
                'ExpediteRequest.TrackingNumber' => formData.get('ExpediteRequest.TrackingNumber'),
                'ExpediteRequest.Cost'           => formData.get('ExpediteRequest.Cost'),
                'ExpediteRequest.PassAlong'      => formData.get('ExpediteRequest.PassAlong'),
                'MakeItRight.Reason'=>formData.get('MakeItRight.Reason'),
                'MakeItRight.amountRequested'=>formData.get('MakeItRight.amountRequested'),
                'TransactionIssue.StoreName'            => formData.get('TransactionIssue.StoreName'),
                'TransactionIssue.TransactionItems'     => formData.get('TransactionIssue.TransactionItems'),
                'TransactionIssue.EventId'              => formData.get('TransactionIssue.EventId'),
                'TransactionIssue.DateOfSwipe'          => formData.get('TransactionIssue.DateOfSwipe'),
                'TransactionIssue.RefundReceipt'        => formData.get('TransactionIssue.RefundReceipt'),
                'ItemScanner.OS'                        => formData.get('ItemScanner.OS'),
                'ItemScanner.Items'                     => formData.get('ItemScanner.Items'),
                'ItemScanner.Model'                     => formData.get('ItemScanner.Model'),
                'ItemScanner.CameraSettingsReset'       => formData.get('ItemScanner.CameraSettingsReset'),
                'ItemScanner.PermissionsReset'          => formData.get('ItemScanner.PermissionsReset'),
                'OnlineApp.AttemptingRegistration'      => formData.get('OnlineApp.AttemptingRegistration'),
                'OnlineApp.PasswordReset'               => formData.get('OnlineApp.PasswordReset'),
                'OnlineApp.Other'                       => formData.get('OnlineApp.Other'),
                'OnlineApp.PasswordResetPWReset'=> formData.get('OnlineApp.PasswordResetPWReset'),
                'OnlineApp.PasswordResetJunkSpamChecked'=> formData.get('OnlineApp.PasswordResetJunkSpamChecked'),
                'BenefitDiscrepancy.MissingBenefit'     => formData.get('BenefitDiscrepancy.MissingBenefit'),
                'BenefitDiscrepancy.OTCGroDvhBenefit'   => formData.get('BenefitDiscrepancy.OTCGroDvhBenefit'),
                'BenefitDiscrepancy.BalanceBenefitInQuestion' => formData.get('BenefitDiscrepancy.BalanceBenefitInQuestion'),
                'BenefitDiscrepancy.BalanceDiscrepancyReason' => formData.get('BenefitDiscrepancy.BalanceDiscrepancyReason')
                };
       


        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://hooks.zapier.com/hooks/catch/23366882/u3ukl4l/');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        String bodyPayload = JSON.serialize(payload);
        System.debug(LoggingLevel.INFO, 'Body Payload JSON => ' + bodyPayload);

        req.setBody(bodyPayload);

        Http http = new Http();
        HttpResponse res = http.send(req);

        System.debug(LoggingLevel.INFO, 'HTTP Response Status Code => ' + res.getStatusCode());
        System.debug(LoggingLevel.INFO, 'HTTP Response Body => ' + res.getBody());

        result.put('statusCode', res.getStatusCode());
        result.put('body', res.getBody());
    } catch (Exception e) {
        result.put('statusCode', -1);
        result.put('body', 'Exception: ' + e.getMessage());
    }

    return result;
}

}