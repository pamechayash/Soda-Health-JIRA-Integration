import { LightningElement, wire,track } from 'lwc';
import getCaseData from '@salesforce/apex/JiraSyncService.getCaseData';
import { CurrentPageReference } from 'lightning/navigation';

import createJiraIssue from '@salesforce/apex/JiraSyncService.createJiraIssue';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateJira extends LightningElement {
     recordId;
      @wire(CurrentPageReference)
  pageRef({ state }) {
    this.recordId = state?.c__recordId;
    if (this.recordId) {
      this.fetchCaseData();
    }
  }

isOpen = true;
showModal = false;
selectedIssueType = '';
selectedIcon = '';
showExpediteReason = false;
showBenefitFields = false;
showIssueTypeCombobox = false;
caseOwner = '';
caseSubject = '';
outboundCall = 'No';
harmonyId = '';
sponsor = '';
rolloverReason = '';
benefitsSelected = [];
additionalDetails = '';

    issueTypes = [
        { label: '10k Testing - Transaction Issues', value: 'Transaction Issues', icon: 'utility:money'},
        { label: '10k Testing - Expedite Request', value: 'Expedite Request',icon: 'utility:priority' },
        { label: '10k Testing - Benefit Extension Request', value: 'Benefit Extension Request',icon: 'utility:people'  },
        { label: '10k Testing - Balance/Benefit Discrepancy', value: 'Balance/Benefit Discrepancy',icon: 'utility:table' },
        { label: '10k Testing - Item Scanner', value: 'Item Scanner', icon: 'utility:scan' },
        { label: '10k Testing - Online/App Experience Issue', value: 'Online/App Experience Issue',icon: 'utility:desktop' }
    ];

yesNoOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
];

rolloverOptions =  [
    {  label: 'System Display Issue', value :'System Display Issue'},
    { label: 'Incorrect Transaction Amount', value : 'Incorrect Transaction Amount'} 
];

sponsorOptions =[{label:'Executive Sponsor',value :'Executive Sponsor'},
{label:'Client / Customer', value:'Client / Customer'},
{label:'Partner Organization', value:'Partner Organization'},
{label:'Vendor', value:'Vendor'}
];

expediteOptions= [
    {label:'Severe Financial Loss', value:'Severe Financial Loss'},
    {label:'Medical or Health Emergency', value:'Medical or Health Emergency'},
    {label:'Urgent Travel Requirement', value:'Urgent Travel Requirement'},
    {label:'Other (Specify)', value:'Other (Specify)'}
];

      @track benefitOptions = [
        { label: 'Incorrect Balance Amount', value: 'Incorrect Balance Amount' },
        { label: 'Missing Benefit Entry', value: 'Missing Benefit Entry' },
        { label: 'Duplicate Payment', value: 'Duplicate Payment' },
        { label: 'Benefit Not Reflected in Statement', value: 'Benefit Not Reflected in Statement' }
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

    handleCheckboxChange(event) {
        const value = event.target.value;
        if (event.target.checked) {
            if (!this.selectedValues.includes(value)) {
                this.selectedValues = [...this.selectedValues, value];
            }
        } else {
            this.selectedValues = this.selectedValues.filter(item => item !== value);
        }
    }

    stopClick(event) {
        event.stopPropagation();
    }
handleSelect(event) {
    const selectedValue = event.currentTarget.dataset.value;
    const selectedItem = this.issueTypes.find(item => item.value === selectedValue);

    if (selectedValue) {
        this.selectedIssueType = selectedValue;
        this.showModal = true;
        this.selectedIcon = selectedItem.icon;
        this.fetchCaseData();
        this.showExpediteReason = false;
        this.showBenefitFields = false;
        this.showIssueTypeCombobox = false;

        if (selectedValue === 'Expedite Request') {
            this.showExpediteReason = true;
        } else if (selectedValue === 'Benefit Extension Request') {
            this.showBenefitFields = true;
        } else {
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
                    this.caseOwner = result.Owner?.Name || ''; 
                    this.caseSubject = result.Subject || '';
                }
                 console.log('result=>',result());
            })
            .catch(error => {
                console.error('Error fetching case:', error);
            });
    }

    handleInputChange(event) {
        const field = event.target.dataset.field;
        this[field] = event.target.value;
    }

    handleBenefitsChange(event) {
        this.benefitsSelected = event.detail.value;
    }

   createJira() {
    const payload = {
        caseId: this.recordId,
        issueType: this.selectedIssueType,
        benefits: this.selectedValues,
        outboundCall: this.outboundCall,
        harmonyId: this.harmonyId,
        sponsor: this.sponsor,
        rolloverReason: this.rolloverReason,
        expediteReason: this.expediteReason,
        additionalDetails: this.additionalDetails,
        caseOwner:this.caseOwner
    };

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