import { LightningElement, wire,track } from 'lwc';
import getCaseData from '@salesforce/apex/JiraSyncService.getCaseData';
import { CurrentPageReference } from 'lightning/navigation';

import createJiraIssue from '@salesforce/apex/JiraSyncService.createJiraIssue';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateJira extends LightningElement {
     recordId;
      @track sponsor ;
      @wire(CurrentPageReference)
  pageRef({ state }) {
   
    this.recordId = state?.c__recordId;
    if (this.recordId) {
          
  
      this.fetchCaseData();
   
    }
  }

isOpen = true;
@track issueOptions = [];
showModal = false;
selectedIssueType = '';
selectedIcon = '';
showMIRReason = false;
mirReason ='';
amountRequested = '';
showExceptionFreeText = false;
showExpediteReason = false;
showBenefitFields = false;
showIssueTypeCombobox = false;
caseOwner = '';
cost='';
passAlong = false;
expediteReason ='';
caseSubject = '';
outboundCall = 'No';
harmonyId = '';
trackingNumber = '';
isOnlineAppAttemptingRegistration = false;
isOnlineAppPasswordReset = false;
isOnlineAppOther = false;

@track isSponsorDisabled = false; 
whatIsTheIssue='';
benefirExtensionReason = '';
benefitsSelected = [];
additionalDetails = '';
@track isTransactionSwipeIssues = false; 
@track isTransactionRefund = false;      
@track isTransactionOther = false;       
@track storeName = '';
@track transactionItems = '';
@track eventId = '';
@track dateOfSwipe = '';
@track refundReceipt = '';

isExpaditeMemberSecondReplacement = false;
isExpaditeMemberNotReceivedCard = false;
isExpaditeRerouteNeeded  =  false;
isOnlineAppAttemptingRegisteration = false;
isOnlineAppPasswordReset = false;
isOnlineAppOthers = false;
@track isItemScannerApprovedNotApproved = false;
@track isItemScannerCameraIssue = false;
@track isItemScannerOther = false;
addressVarification='No';
junkSpamChecked = 'No';
pwRestSend= 'No';
showBenefitDiscrepancy = false;
showBalanceDiscrepancy = false;
showOtherDiscrepancy = false;
missingBenefit = '';
otcGroDvhBenefit = '';
balanceBenefitInQuestion = '';
balanceDiscrepancyReason = '';

balanceDiscrepancyOptions = [
    { label: "Funds exhausted, but didn't swipe for all funds", value: "Funds exhausted, but didn't swipe for all funds" },
    { label: "Benefits did not reload", value: "Benefits did not reload" }
];

addressVarificationOptions = [{
    label: 'Yes',
    value: 'Yes'
},
{
    label: 'No',
    value: 'No'
}
]

pwRestSendOptions =[{
     label: 'Yes',
    value: 'Yes'
},
{
    label: 'No',
    value: 'No'
}
]
osOptions = [
    { label: 'iOS', value: 'iOS' },
    { label: 'Android', value: 'Android' },
    { label: 'Other...', value: 'Other' }
];

get isExpaditeAdditionalFieldVisible(){
   if(this.isExpaditeMemberSecondReplacement || this.isExpaditeMemberNotReceivedCard || this.isExpaditeRerouteNeeded ){
    return true;
   }
   else{
    return false;
   }
   
}
get isExpaditeAddressVarFieldVisible(){
    if(this.isExpaditeMemberSecondReplacement || this.isExpaditeMemberNotReceivedCard){
        return true;
       }
       else{
        return false;
       }
}
get isOnlineAppAdditionalFieldVisible() {
    return this.isOnlineAppAttemptingRegistration || this.isOnlineAppPasswordReset || this.isOnlineAppOther;
}

get isOnlineAppPwResetFieldsVisible() {
    return this.isOnlineAppPasswordReset;
}
get isItemScannerCameraFieldsVisible() {
    return this.isItemScannerCameraIssue;
}

get isItemScannerApprovedItemsVisible() {
    return this.isItemScannerApprovedNotApproved;
}

get isItemScannerAdditionalFieldVisible() {
    return this.isItemScannerCameraIssue || this.isItemScannerOther;
}

handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.refundReceipt = reader.result.split(',')[1]; 
            console.log('File Upload',this.refundReceipt);
        };
        reader.readAsDataURL(file);
    }
}


    issueTypes = [
        { label: '10k Testing - Exception', value: 'Exception', icon: 'utility:error'},
        { label: '10k Testing - Make-It-Right', value: 'Make-It-Right', icon: 'utility:check'},
        { label: '10k Testing - Transaction Issues', value: 'Transaction Issues', icon: 'utility:money'},
        { label: '10k Testing - Expedite Request', value: 'Expedite Request',icon: 'utility:priority' },
        { label: '10k Testing - Benefit Extension Request', value: 'Benefit Extension Request',icon: 'utility:people'  },
        { label: '10k Testing - Balance/Benefit Discrepancy', value: 'Balance/Benefit Discrepancy',icon: 'utility:table' },
        { label: '10k Testing - Item Scanner', value: 'Item Scanner', icon: 'utility:scan' },
        { label: '10k Testing - Online/App Experience Issue', value: 'Online/App Experience Issue',icon: 'utility:desktop' }
    ];

    mirOptions =[     
    {  label: 'Order correction (agent error)', value :'Order correction (agent error)'},
    {  label: 'Order correction (member error)', value :'Order correction (member error)'},
    {  label: 'Order correction (vendor error)', value :'Order correction (vendor error)'},
    {  label: 'Fee(s)', value :'Fee(s)'},
    {  label: 'Transaction dispute', value :'Transaction dispute'},
    {  label: 'Other…', value :'Other…'},

    ]

yesNoOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
];

benefitextensionOptions =  [
    {  label: 'Card not received, can not spend benefit(s)', value :'Card not received, can not spend benefit(s)'},
     { label: 'Exceptional circumstance', value : 'Exceptional circumstance'}
   
   
];


sponsorOptions = [
    { label: 'AmeriHealth/CVCD', value: 'AmeriHealth/CVCD' },
    { label: 'AmeriHealth/CVCF', value: 'AmeriHealth/CVCF' },
    { label: 'AmeriHealth/CVCP', value: 'AmeriHealth/CVCP' },
    { label: 'AmeriHealth/FCVC', value: 'AmeriHealth/FCVC' },
    { label: 'AmeriHealth/KFVC', value: 'AmeriHealth/KFVC' },
    { label: 'AmeriHealth/MMPM', value: 'AmeriHealth/MMPM' },
    { label: 'AmeriHealth/MMPS', value: 'AmeriHealth/MMPS' },
    { label: 'BHZ', value: 'BHZ' },
    { label: 'BMA', value: 'BMA' },
    { label: 'BUFC', value: 'BUFC' },
    { label: 'GHCE', value: 'GHCE' },
    { label: 'HHHK', value: 'HHHK' },
    { label: 'HHWF', value: 'HHWF' },
    { label: 'HPSJ', value: 'HPSJ' },
    { label: 'HUM', value: 'HUM' },
    { label: 'IHPC', value: 'IHPC' },
    { label: 'IHPX', value: 'IHPX' },
    { label: 'NETC', value: 'NETC' },
    { label: 'NHPRI', value: 'NHPRI' },
    { label: 'OCCO', value: 'OCCO' },
    { label: 'PPHP', value: 'PPHP' },
    { label: 'SCAN', value: 'SCAN' },
    { label: 'SFHP', value: 'SFHP' },
    { label: 'SUMC', value: 'SUMC' },
    { label: 'TUFT', value: 'TUFT' },
    { label: 'UCLA', value: 'UCLA' },
    { label: 'UKY (FAHA)', value: 'UKY (FAHA)' },
    { label: 'UKY (FAHH)', value: 'UKY (FAHH)' },
    { label: 'UKY (FAHM)', value: 'UKY (FAHM)' }
];
;

expediteOptions= [
    {label:"Member's 2nd replacement (original card and 1st replacement not received)", value:"Member's 2nd replacement (original card and 1st replacement not received)"},
    {label:'Member never received their card (end of the month/quarter is coming up)', value:'Member never received their card (end of the month/quarter is coming up)'},
    {label:'Reroute needed/temporary relocation', value:'Reroute needed/temporary relocation'}
];

      @track benefitOptions = [
        { label: 'Flex Allowance (DVH)', value: 'Flex Allowance (DVH)' },
        { label: 'Grocery', value: 'Grocery' },
        { label: 'OTC', value: 'OTC' },
        { label: 'OTCGRO', value: 'OTCGRO' },
        { label: 'Other…', value: 'Other…' }

    ];

    @track selectedValues = [];
    @track isOpendropdpwn = false;

    get benefitOptionsWithSelection() {
        return this.benefitOptions.map(option => ({
            ...option,
            checked: this.selectedValues.includes(option.value)
        }));
    }

    get selectedLabels() {
        return this.selectedValues.length > 0 ? this.selectedValues.join(', ') : 'Select...';
    }

    get dropdownClass() {
        return `slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click ${this.isOpendropdpwn ? 'slds-is-open' : ''}`;
    }

    toggleDropdown() {
        this.isOpendropdpwn = !this.isOpendropdpwn;
    }
   
   
    issueOptionsMap = {
    'Transaction Issues': [
        { label: 'Approved swipe on unapproved items', value: 'Approved swipe on unapproved items' },
        { label: 'Declined swipe on approved items', value: 'Declined swipe on approved items' },
        { label: 'Declined swipe missing from M.Admin', value: 'Declined swipe missing from M.Admin' },
        { label: 'Refund not received (more than 3 days)', value: 'Refund not received (more than 3 days)' },
        { label: 'Other…', value: 'Other…' },
       
    ],
    'Item Scanner': [
         { 
            label: "Approved items show 'not approved'", 
            value: "Approved items show 'not approved'" 
        },
        { label: 'Camera not opening', value: 'Camera not opening' },
        { label: 'Camera not reading barcodes', value: 'Camera not reading barcodes'},
        { label: 'Settings/permissions not saving', value: 'Settings/permissions not saving'},
        { label: "Unapproved items show 'approved'", value: "Unapproved items show 'approved'"},
        { label: 'Other…', value: 'Other…' }
    ],
    'Online/App Experience Issue': [
        { label: "Attempting registration, but 'info not found'", value: "Attempting registration, but 'info not found'" },
        { label: 'Password reset email not received', value: 'Password reset email not received' },
        { label: 'Other…', value: 'Other…' }
    ],
    'Balance/Benefit Discrepancy': [
        { label: 'Benefit discrepancy (missing a benefit)', value: 'Benefit discrepancy (missing a benefit)' },
        { label: 'Balance discrepancy (missing funds from a benefit)', value: 'Balance discrepancy (missing funds from a benefit)' },
        { label: 'Other…', value: 'Other…' }
    ]

};
handlePassAlongChange(event) {
    this.passAlong = event.target.checked;
    console.log('passAlong', this.passAlong);
}

    stopClick(event) {
        event.stopPropagation();
    }
    



handleSelect(event) {
    
    const selectedValue = event.currentTarget.dataset.value;
    const selectedItem = this.issueTypes.find(item => item.value === selectedValue);
   
    //reset variables :
    this.isExpaditeMemberSecondReplacement = false;
    this.isExpaditeMemberNotReceivedCard = false;
    this.isExpaditeRerouteNeeded  =  false;
    this.showBenefitDiscrepancy = false;
    this.showBalanceDiscrepancy = false;
    this.showOtherDiscrepancy = false;

        this.isItemScannerApprovedNotApproved = false;
        this.isItemScannerCameraIssue = false;
        this.isItemScannerOther = false;
        this.isTransactionSwipeIssues = false;
        this.isTransactionRefund = false;
        this.isTransactionOther = false;

    if (selectedValue) {
        this.selectedIssueType = selectedValue;
        this.showModal = true;
        this.selectedIcon = selectedItem.icon;
        this.fetchCaseData();
        this.showExpediteReason = false;
        this.showBenefitFields = false;
        this.showExceptionFreeText = false;
        this.showIssueTypeCombobox = false;
        this.showMIRReason= false;
        if (selectedValue === 'Exception'){
            this.showIssueTypeCombobox = false;
            this.showExceptionFreeText = true;
        }
        else if (selectedValue === 'Make-It-Right'){
             this.showExceptionFreeText = true;
              this.showMIRReason= true;
        }
        else if (selectedValue === 'Expedite Request') {
            this.showExpediteReason = true;
           
        } else if (selectedValue === 'Benefit Extension Request') {
            this.showBenefitFields = true;
            this.showExceptionFreeText = true;
        } else {
            // Show dynamic issue combobox
            this.issueOptions = this.issueOptionsMap[selectedValue] || [];
            this.showIssueTypeCombobox = true;
        }
    }
}
    closeModal() {
        this.showModal = false;
    }

    fetchCaseData() {
        getCaseData({ caseId: this.recordId })
            .then(result => {
                if (result) {
                    console.log('result',JSON.stringify(result));
                    this.caseOwner = result.Owner?.Name || ''; 
                    this.caseSubject = result.Subject || '';
                    this.harmonyId = result.Harmony_ID__c || '';
                    console.log('harmonyId'+this.harmonyId);
                   if (result.Account?.Short_Code__c) {
                  this.sponsor = result.Account.Short_Code__c;
               
                    console.log('sponsor',this.sponsor);
                    this.isSponsorDisabled = true;  
                } else {
                    this.sponsor = ''; 
                    this.isSponsorDisabled = false; 
               }
            }        })

            .catch(error => {
                console.error('Error fetching case:', error);
            });
    }

   

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
        console.log('filed=>'  ,this[field]);
        if(field === 'expediteReason'){
            this.expediteReason = event.target.value;
            if(this.expediteReason=='Member\'s 2nd replacement (original card and 1st replacement not received)'){
                this.isExpaditeMemberSecondReplacement = true;
                this.isExpaditeRerouteNeeded=false;
                this.isExpaditeMemberNotReceivedCard=false;

            }
            else if(this.expediteReason=='Member never received their card (end of the month/quarter is coming up)'){
                this.isExpaditeMemberSecondReplacement = false;
                this.isExpaditeRerouteNeeded=false;
                this.isExpaditeMemberNotReceivedCard=true;
            }
            else {
                this.isExpaditeMemberSecondReplacement = false;
                this.isExpaditeRerouteNeeded=true;
                this.isExpaditeMemberNotReceivedCard=false;
            }
        }
       else if (field === 'whatIsTheIssue' && this.selectedIssueType === 'Item Scanner') {
    this.isItemScannerApprovedNotApproved = false;
    this.isItemScannerCameraIssue = false;
    this.isItemScannerOther = false;

    if (['Camera not opening', 'Camera not reading barcodes', 'Settings/permissions not saving'].includes(this.whatIsTheIssue)) {
        this.isItemScannerCameraIssue = true; // Show OS, Model, Additional Details
    } 
    else if (["Approved items show 'not approved'", "Unapproved items show 'approved'"].includes(this.whatIsTheIssue)) {
        this.isItemScannerApprovedNotApproved = true; // Show only Item(s)
    } 
    else if (this.whatIsTheIssue === 'Other…') {
        this.isItemScannerOther = true; // Show only Additional Details
    }

        }
    
else if (field === 'whatIsTheIssue' && this.selectedIssueType === 'Online/App Experience Issue') {
    this.whatIsTheIssue = event.target.value;
    console.log('whatIsTheIssue=>'  ,this.whatIsTheIssue);

    if (this.whatIsTheIssue === "Attempting registration, but 'info not found'") {
        this.isOnlineAppAttemptingRegistration = true;
        this.isOnlineAppPasswordReset = false;
        this.isOnlineAppOther = false;
    } 
    else if (this.whatIsTheIssue === 'Password reset email not received') {
        this.isOnlineAppAttemptingRegistration = false;
        this.isOnlineAppPasswordReset = true;
        this.isOnlineAppOther = false;
    } 
    else {
        this.isOnlineAppAttemptingRegistration = false;
        this.isOnlineAppPasswordReset = false;
        this.isOnlineAppOther = true;
    }
}
 else if (field === 'whatIsTheIssue' && this.selectedIssueType === 'Balance/Benefit Discrepancy') {
    this.whatIsTheIssue = event.target.value;

    // Reset all first
    this.showBenefitDiscrepancy = false;
    this.showBalanceDiscrepancy = false;
    this.showOtherDiscrepancy = false;

    if (this.whatIsTheIssue === 'Benefit discrepancy (missing a benefit)') {
        this.showBenefitDiscrepancy = true;
    } else if (this.whatIsTheIssue === 'Balance discrepancy (missing funds from a benefit)') {
        this.showBalanceDiscrepancy = true; 
    } else if (this.whatIsTheIssue === 'Other…') {  // use same character (…) as your options
        this.showOtherDiscrepancy = true;
    }
}

 else if (field === 'whatIsTheIssue'  && this.selectedIssueType === 'Transaction Issues') {
        this.whatIsTheIssue = event.target.value;

        if (
            this.whatIsTheIssue === "Approved swipe on unapproved items" ||
            this.whatIsTheIssue === "Declined swipe on approved items" ||
            this.whatIsTheIssue === "Declined swipe missing from M.Admin"
        ) {
            this.isTransactionSwipeIssues = true;
        } else if (this.whatIsTheIssue === "Refund not received (more than 3 days)") {
            this.isTransactionRefund = true;
        } else if (this.whatIsTheIssue === "Other…") {
            this.isTransactionOther = true;
        }
    }
  else if (field === 'whatIsTheIssue'  && this.selectedIssueType === 'Balance/Benefit Discrepancy') {
    this.whatIsTheIssue = event.target.value;

    if (this.whatIsTheIssue === 'Benefit discrepancy (missing a benefit)') {
        this.isBenefitDiscrepancy = true;
        this.isBalanceDiscrepancy = false;
        this.isBenefitOther = false;
    } 
    else if (this.whatIsTheIssue === 'Balance discrepancy (missing funds from a benefit)') {
        this.isBenefitDiscrepancy = false;
        this.isBalanceDiscrepancy = true;
        this.isBenefitOther = false;
    } 
    else {
        this.isBenefitDiscrepancy = false;
        this.isBalanceDiscrepancy = false;
        this.isBenefitOther = true;
    }
}
               

     const value = event.target.value;
        if (event.target.checked) {
            if (!this.selectedValues.includes(value)) {
                this.selectedValues = [...this.selectedValues, value];
            }
        } else {
            this.selectedValues = this.selectedValues.filter(item => item !== value);
        }}

   createJira(){
    const payload = {
        caseId: '500VG00000VI82CYAT',
        issueType: 'Online/App Experience Issue',
        benefits: ['Grocery', 'OTC'],
        outboundCall: 'Yes',
        harmonyId: 'HARM-001',
        sponsor: 'AmeriHealth/CVCD',
        benefirExtensionReason: 'Exceptional circumstance',
        expediteReason: 'Member never received their card (end of the month/quarter is coming up)',
        "ExpediteRequest.addressVerification": 'Yes',
        "ExpediteRequest.temporaryAddress": '123 Temporary Address',
        additionalDetails: 'This is a hard-coded test payload.',
        caseOwner: 'John Doe',
        "ExpediteRequest.TrackingNumber": 'TRACK-98765',
        "ExpediteRequest.Cost": '50',
        "ExpediteRequest.PassAlong": true,
        "MakeItRight.Reason": 'Order correction (agent error)',
        "MakeItRight.amountRequested": '100',
        whatIsTheIssue: "Password reset email not received",
        "TransactionIssue.StoreName": 'Walmart Store #45',
        "TransactionIssue.TransactionItems": 'Item1, Item2, Item3',
        "TransactionIssue.EventId": 'EVT-2025-01',
        "TransactionIssue.DateOfSwipe": '2025-07-24',
        "TransactionIssue.RefundReceipt": 'REFUND-IMG-BASE64',
        "ItemScanner.OS": 'iOS',
        "ItemScanner.Items": 'ItemScanner Test Items',
        "ItemScanner.Model": 'iPhone 15 Pro',
        "ItemScanner.CameraSettingsReset": 'Yes',
        "ItemScanner.PermissionsReset": 'No',
        "OnlineApp.AttemptingRegistration": true,
        "OnlineApp.PasswordReset": true,
        "OnlineApp.PasswordResetPWReset": 'Yes',
        "OnlineApp.PasswordResetJunkSpamChecked": 'Yes',
        "OnlineApp.Other": false,
        "BenefitDiscrepancy.MissingBenefit": 'Grocery',
        "BenefitDiscrepancy.OTCGroDvhBenefit": 'OTCGRO',
        "BenefitDiscrepancy.BalanceBenefitInQuestion": 'Flex Allowance (DVH)',
        "BenefitDiscrepancy.BalanceDiscrepancyReason": 'Benefits did not reload'
    };

    console.log('payload'+JSON.stringify(payload));
    createJiraIssue({ formData: payload })
        .then(result => {
            const status = result.statusCode;
            const body = result.body;

            if (status === 200 || status === 201) {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'JIRA issue created successfully.',
                    variant: 'success'
                }));
                this.showModal = false;
            } else {
                this.dispatchEvent(new ShowToastEvent({
                    title: `Error (${status})`,
                    message: body || 'Unknown error occurred.',
                    variant: 'error',
                    mode: 'sticky'
                }));
            }
        })
        .catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Callout Failure',
                message: error.body?.message || error.message || 'Failed to call Apex',
                variant: 'error',
                mode: 'sticky'
            }));
        });
}


}