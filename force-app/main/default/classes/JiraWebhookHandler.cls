@RestResource(urlMapping='/jira/webhook')
global without sharing class JiraWebhookHandler {
    
    @HttpPost
    global static void handleWebhook() {
        system.debug('called');
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();
        
        // Parse incoming JSON from Jira
        Map<String, Object> payload = (Map<String, Object>) JSON.deserializeUntyped(body);
        String newStatus = null;
        if (payload.containsKey('changelog')) {
            Map<String, Object> changelog = (Map<String, Object>) payload.get('changelog');
            List<Object> items = (List<Object>) changelog.get('items');
            for (Object itemObj : items) {
                Map<String, Object> item = (Map<String, Object>) itemObj;
                if ('status'.equalsIgnoreCase((String) item.get('field'))) {
                    newStatus = (String) item.get('toString'); // final transitioned value
                    break;
                }
            }
        }
        // Extract issue key , summary and description
        Map<String, Object> issue = (Map<String, Object>) payload.get('issue');
        Map<String, Object> comment = (Map<String, Object>) payload.get('comment');
        String commentBody=null;
        if(comment!=null){
            commentBody = (String) comment.get('body'); 
        }
        
        System.debug('commentBody'+commentBody);
        
        String issueKey = (String) issue.get('key');
        Map<String, Object> fields = (Map<String, Object>) issue.get('fields');
        System.debug('fields'+fields);
        System.debug('issueKey'+issueKey);
        String summary = (String) fields.get('summary');
        String descriptionText=(String) fields.get('description');
        Map<String,Object>  priorityObj= (Map<String,Object>)Json.deserializeUntyped(Json.serialize(fields.get('priority')));
        
        String priority = (String) priorityObj.get('name');
        
        
        List<Case> cases=[Select Description,Subject,Id,Jira_Issue_Key__c from Case where Jira_Issue_Key__c= :issueKey];
        System.debug('Existingcases'+cases);
        if(cases.size()>0){
            cases[0].Subject = summary;
            cases[0].Description = descriptionText;
            cases[0].Priority =priority;
            if(newStatus!=null){
                cases[0].Jira_Status__c = newStatus; 
            }
            
            if(commentBody!=null){
                
                CaseComment caseCom = new CaseComment();
                caseCom.ParentId = cases[0].Id;
                caseCom.CommentBody =commentBody;
                insert caseCom;
            }
            update cases;
        }
        else
        {
            Case c = new Case(Subject = summary,Priority=priority,Description=descriptionText,Origin='Email',Jira_Issue_Key__c=issueKey);
            if(newStatus!=null){
                c.Jira_Status__c = newStatus; 
            }
            insert c;
        }       
    }
}