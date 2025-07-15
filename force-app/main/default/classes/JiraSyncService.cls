public with sharing class JiraSyncService {
    @AuraEnabled(cacheable=true)
    public static Case getCaseData(Id caseId) {
        try {
            System.debug('case id => ' + caseId);
            return [
                SELECT Id, Subject, Comments, Priority, Status, Owner.Name
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
        Case c = [SELECT Id, Subject, Comments, Priority, Status FROM Case WHERE Id = :caseId LIMIT 1];

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
            'sponsor'          => formData.get('sponsor'),
            'rolloverReason'   => formData.get('rolloverReason'),
            'expediteReason'   => formData.get('expediteReason'),
            'additionalDetails'=> formData.get('additionalDetails'),
             'caseOwner'=>formData.get('caseOwner')
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