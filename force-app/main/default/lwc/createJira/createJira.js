import { LightningElement, wire, track } from 'lwc';
import getCaseData from '@salesforce/apex/JiraSyncService.getCaseData';
import { CurrentPageReference } from 'lightning/navigation';
import createJiraIssue from '@salesforce/apex/JiraSyncService.createJiraIssue';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateJira extends LightningElement {
    recordId;
     sponsor;
    @wire(CurrentPageReference)
    pageRef({ state }) {
        this.recordId = state?.c__recordId;
        if (this.recordId) {
            this.fetchCaseData();
        }
    }

    isOpen = true;
     issueOptions = [];
    showModal = false;
    selectedIssueType = '';
    selectedIcon = '';
    showMIRReason = false;
    mirReason = '';
    amountRequested = '';
    showExceptionFreeText = false;
    showExpediteReason = false;
    showBenefitFields = false;
    showIssueTypeCombobox = false;
    caseOwner = '';
    cost = '';
    passAlong = false;
    expediteReason = '';
    caseSubject = '';
    outboundCall = 'No';
    harmonyId = '';
    trackingNumber = '';
    refundReceipt = '';
    whatIsTheIssue = '';
    benefirExtensionReason = '';
    additionalDetails = '';
     selectedValues = [];

    // Transaction Issue fields
     isTransactionSwipeIssues = false;
     isTransactionRefund = false;
     isTransactionOther = false;
     storeName = '';
     transactionItems = '';
     eventId = '';
     dateOfSwipe = '';

    // Expedite Request flags and fields
    isExpaditeMemberSecondReplacement = false;
    isExpaditeMemberNotReceivedCard = false;
    isExpaditeRerouteNeeded = false;
    temporaryAddress = '';

    // Online/App Issue flags
    isOnlineAppAttemptingRegistration = false;
    isOnlineAppPasswordReset = false;
    isOnlineAppOther = false;
    pwResetSent = 'No';
    junkSpamChecked = 'No';

    isItemScannerApprovedNotApproved = false;
    isItemScannerCameraIssue = false;
     isItemScannerOther = false;
    itemScannerOS = '';
    itemScannerItems = '';
    itemScannerModel = '';
    cameraSettingsReset = '';
    permissionsReset = '';

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

    addressVarification = 'No';
    addressVarificationOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];

    yesNoOptions = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ];
benefitextensionOptions = [
    { label: 'Card not received, can not spend benefit(s)', value: 'Card not received, can not spend benefit(s)' },
    { label: 'Exceptional circumstance', value: 'Exceptional circumstance' }
];

    expediteOptions = [
        { label: "Member's 2nd replacement (original card and 1st replacement not received)", value: "Member's 2nd replacement (original card and 1st replacement not received)" },
        { label: 'Member never received their card (end of the month/quarter is coming up)', value: 'Member never received their card (end of the month/quarter is coming up)' },
        { label: 'Reroute needed/temporary relocation', value: 'Reroute needed/temporary relocation' }
    ];

    mirOptions = [
        { label: 'Order correction (agent error)', value: 'Order correction (agent error)' },
        { label: 'Order correction (member error)', value: 'Order correction (member error)' },
        { label: 'Order correction (vendor error)', value: 'Order correction (vendor error)' },
        { label: 'Fee(s)', value: 'Fee(s)' },
        { label: 'Transaction dispute', value: 'Transaction dispute' },
        { label: 'Other…', value: 'Other…' },
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

    osOptions = [
        { label: 'iOS', value: 'iOS' },
        { label: 'Android', value: 'Android' },
        { label: 'Other...', value: 'Other' }
    ];

    @track benefitOptions = [
        { label: 'Flex Allowance (DVH)', value: 'Flex Allowance (DVH)' },
        { label: 'Grocery', value: 'Grocery' },
        { label: 'OTC', value: 'OTC' },
        { label: 'OTCGRO', value: 'OTCGRO' },
        { label: 'Other…', value: 'Other…' }
    ];

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

    get isExpaditeAdditionalFieldVisible() {
        return this.isExpaditeMemberSecondReplacement || this.isExpaditeMemberNotReceivedCard || this.isExpaditeRerouteNeeded;
    }

    get isExpaditeAddressVarFieldVisible() {
        return this.isExpaditeMemberSecondReplacement || this.isExpaditeMemberNotReceivedCard;
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

    // Issue Types and their icon mappings
    issueTypes = [
        { label: '10k Testing - Exception', value: 'Exception', icon: 'utility:error' },
        { label: '10k Testing - Make-It-Right', value: 'Make-It-Right', icon: 'utility:check' },
        { label: '10k Testing - Transaction Issues', value: 'Transaction Issues', icon: 'utility:money' },
        { label: '10k Testing - Expedite Request', value: 'Expedite Request', icon: 'utility:priority' },
        { label: '10k Testing - Benefit Extension Request', value: 'Benefit Extension Request', icon: 'utility:people' },
        { label: '10k Testing - Balance/Benefit Discrepancy', value: 'Balance/Benefit Discrepancy', icon: 'utility:table' },
        { label: '10k Testing - Item Scanner', value: 'Item Scanner', icon: 'utility:scan' },
        { label: '10k Testing - Online/App Experience Issue', value: 'Online/App Experience Issue', icon: 'utility:desktop' }
    ];

    issueOptionsMap = {
        'Transaction Issues': [
            { label: 'Approved swipe on unapproved items', value: 'Approved swipe on unapproved items' },
            { label: 'Declined swipe on approved items', value: 'Declined swipe on approved items' },
            { label: 'Declined swipe missing from M.Admin', value: 'Declined swipe missing from M.Admin' },
            { label: 'Refund not received (more than 3 days)', value: 'Refund not received (more than 3 days)' },
            { label: 'Other…', value: 'Other…' }
        ],
        'Item Scanner': [
            { label: "Approved items show 'not approved'", value: "Approved items show 'not approved'" },
            { label: 'Camera not opening', value: 'Camera not opening' },
            { label: 'Camera not reading barcodes', value: 'Camera not reading barcodes' },
            { label: 'Settings/permissions not saving', value: 'Settings/permissions not saving' },
            { label: "Unapproved items show 'approved'", value: "Unapproved items show 'approved'" },
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

    stopClick(event) {
        event.stopPropagation();
    }

    resetDependentFlags() {
        this.isExpaditeMemberSecondReplacement = false;
        this.isExpaditeMemberNotReceivedCard = false;
        this.isExpaditeRerouteNeeded = false;

        this.showBenefitDiscrepancy = false;
        this.showBalanceDiscrepancy = false;
        this.showOtherDiscrepancy = false;

        this.isItemScannerApprovedNotApproved = false;
        this.isItemScannerCameraIssue = false;
        this.isItemScannerOther = false;

        this.isTransactionSwipeIssues = false;
        this.isTransactionRefund = false;
        this.isTransactionOther = false;

        this.isOnlineAppAttemptingRegistration = false;
        this.isOnlineAppPasswordReset = false;
        this.isOnlineAppOther = false;

        this.showExpediteReason = false;
        this.showBenefitFields = false;
        this.showExceptionFreeText = false;
        this.showIssueTypeCombobox = false;
        this.showMIRReason = false;
    }

    handleSelect(event) {
        const selectedValue = event.currentTarget.dataset.value;
        const selectedItem = this.issueTypes.find(item => item.value === selectedValue);

        this.resetDependentFlags();

        if (selectedValue) {
            this.selectedIssueType = selectedValue;
            this.showModal = true;
            this.selectedIcon = selectedItem.icon;
            this.fetchCaseData();

            switch (selectedValue) {
                case 'Exception':
                    this.showExceptionFreeText = true;
                    break;
                case 'Make-It-Right':
                    this.showExceptionFreeText = true;
                    this.showMIRReason = true;
                    break;
                case 'Expedite Request':
                    this.showExpediteReason = true;
                    break;
                case 'Benefit Extension Request':
                    this.showBenefitFields = true;
                    this.showExceptionFreeText = true;
                    break;
                default:
                    this.issueOptions = this.issueOptionsMap[selectedValue] || [];
                    this.showIssueTypeCombobox = true;
                    break;
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
                    this.caseOwner = result.Owner?.Name || '';
                    this.caseSubject = result.Subject || '';
                    this.harmonyId = result.Harmony_ID__c || '';
                    this.sponsor = result.Account?.Short_Code__c || '';
                    this.isSponsorDisabled = !!result.Account?.Short_Code__c;
                }
            })
            .catch(error => {
                console.error('Error fetching case:', error);
            });
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        const value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;

        if (field) {
            if (field === 'expediteReason') {
                this.handleExpediteReason(value);
            } else if (field === 'whatIsTheIssue') {
                this.handleWhatIsTheIssueChange(value);
            } else if (field === 'passAlong') {
                this.passAlong = value;
        } else if (field === 'benefitOptions') {
            if (value) {
                if (!this.selectedValues.includes(event.target.value)) {
                    this.selectedValues = [...this.selectedValues, event.target.value];
                }
            } else {
                this.selectedValues = this.selectedValues.filter(item => item !== event.target.value);
            }
        } else {
            this[field] = value;
        }
    
        } else {
                this[field] = value;
            }
            console.log(`Field ${field} changed to`, value);
        }
    

    handleExpediteReason(value) {
        this.expediteReason = value;
        this.isExpaditeMemberSecondReplacement = value === "Member's 2nd replacement (original card and 1st replacement not received)";
        this.isExpaditeMemberNotReceivedCard = value === 'Member never received their card (end of the month/quarter is coming up)';
        this.isExpaditeRerouteNeeded = !(this.isExpaditeMemberSecondReplacement || this.isExpaditeMemberNotReceivedCard);
    }

    handleWhatIsTheIssueChange(value) {
        this.whatIsTheIssue = value;
        this.isTransactionSwipeIssues = false;
        this.isTransactionRefund = false;
        this.isTransactionOther = false;

        this.isItemScannerApprovedNotApproved = false;
        this.isItemScannerCameraIssue = false;
        this.isItemScannerOther = false;

        this.isOnlineAppAttemptingRegistration = false;
        this.isOnlineAppPasswordReset = false;
        this.isOnlineAppOther = false;

        this.showBenefitDiscrepancy = false;
        this.showBalanceDiscrepancy = false;
        this.showOtherDiscrepancy = false;

        switch (this.selectedIssueType) {
            case 'Transaction Issues':
                if (["Approved swipe on unapproved items", "Declined swipe on approved items", "Declined swipe missing from M.Admin"].includes(value)) {
                    this.isTransactionSwipeIssues = true;
                } else if (value === "Refund not received (more than 3 days)") {
                    this.isTransactionRefund = true;
                } else if (value === "Other…") {
                    this.isTransactionOther = true;
                }
                break;
            case 'Item Scanner':
                if (['Camera not opening', 'Camera not reading barcodes', 'Settings/permissions not saving'].includes(value)) {
                    this.isItemScannerCameraIssue = true;
                } else if (["Approved items show 'not approved'", "Unapproved items show 'approved'"].includes(value)) {
                    this.isItemScannerApprovedNotApproved = true;
                } else if (value === 'Other…') {
                    this.isItemScannerOther = true;
                }
                break;
            case 'Online/App Experience Issue':
                if (value === "Attempting registration, but 'info not found'") {
                    this.isOnlineAppAttemptingRegistration = true;
                } else if (value === 'Password reset email not received') {
                    this.isOnlineAppPasswordReset = true;
                } else {
                    this.isOnlineAppOther = true;
                }
                break;
            case 'Balance/Benefit Discrepancy':
                this.showBenefitDiscrepancy = value === 'Benefit discrepancy (missing a benefit)';
                this.showBalanceDiscrepancy = value === 'Balance discrepancy (missing funds from a benefit)';
                this.showOtherDiscrepancy = value === 'Other…';
                break;
            default:
                break;
        }
    }


    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.refundReceipt = reader.result.split(',')[1];
                console.log('File Upload', this.refundReceipt);
            };
            reader.readAsDataURL(file);
        }
    }

    stopClick(event) {
        event.stopPropagation();
    }

    createJira() {
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

        console.log('payload', JSON.stringify(payload));

        createJiraIssue({ formData: payload })
            .then(result => {
                const status = result.statusCode;
                const body = result.body;

                if (status === 200 || status === 201) {
                    this.showToast('Success', 'JIRA issue created successfully.', 'success');
                    this.showModal = false;
                } else {
                    this.showToast(`Error (${status})`, body || 'Unknown error occurred.', 'error', true);
                }
            })
            .catch(error => {
                this.showToast('Callout Failure', error.body?.message || error.message || 'Failed to call Apex', 'error', true);
            });
    }

    showToast(title, message, variant, mode = 'dismissable') {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant, mode }));
    }
}