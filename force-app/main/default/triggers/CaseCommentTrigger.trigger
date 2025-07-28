trigger CaseCommentTrigger on CaseComment (after insert) {
    for (CaseComment cc : Trigger.new) {
        if (cc.ParentId != null) {
            JiraSyncService.postCommentToJira(cc.Id);
        }
    }
}