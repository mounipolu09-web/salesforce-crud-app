import { ContactService } from './services/contact.service';
import { LeadService } from './services/lead.service';
import { CaseService } from './services/case.service';
import { Component, OnInit } from '@angular/core';
import { AccountService } from './services/account.service';
import { OpportunityService } from './services/opportunity.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  selectedObject: string = 'Account';

  salesforceObjects: string[] = [
    'Account',
    'Opportunity',
    'Lead',
    'Contact',
    'Case'
  ];
cases: any[] = [];

newCase: any = {
  Subject: '',
  Description: '',
  Status: 'New',
  Priority: 'Medium',
  Origin: 'Web'
};

editingCase: any = null;
  // Account Properties
  accounts: any[] = [];
accountPage: number = 1;
isLoadingAccounts: boolean = false;
hasMoreAccounts: boolean = true;
  newAccount = {
    Name: '',
    Industry: '',
    Phone: ''
  };

  editingAccount: any = null;

  // Opportunity Properties
opportunities: any[] = [];

newOpportunity = {
  Name: '',
  StageName: '',
  CloseDate: '',
  Amount: null
};

editingOpportunity: any = null;

opportunityPage: number = 1;
isLoadingOpportunities: boolean = false;
hasMoreOpportunities: boolean = true;

// Lead Properties
leads: any[] = [];
leadPage: number = 1;
isLoadingLeads: boolean = false;
hasMoreLeads: boolean = true;
newLead = {
  FirstName: '',
  LastName: '',
  Company: '',
  Email: '',
  Phone: '',
  Status: 'Open - Not Contacted'
};
contacts: any[] = [];

newContact: any = {
  FirstName: '',
  LastName: '',
  Email: '',
  Phone: ''
};

contactPage = 1;
isLoadingContacts = false;
hasMoreContacts = true;
editingContact: any = null;
editingLead: any = null;
  

  constructor(
  private accountService: AccountService,
  private opportunityService: OpportunityService,
  private leadService: LeadService,
  private contactService: ContactService,
  private caseService: CaseService

) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  onObjectChange(): void {
  console.log('Selected object:', this.selectedObject);

  if (this.selectedObject === 'Account') {
    this.resetAccounts();

  } else if (this.selectedObject === 'Opportunity') {
    this.resetOpportunities();

  } else if (this.selectedObject === 'Lead') {
    this.resetLeads();

  } else if (this.selectedObject === 'Contact') {
    this.loadContacts();

  } else if (this.selectedObject === 'Case') {
    this.loadCases();

  } else {
    this.accounts = [];
    this.opportunities = [];
    this.leads = [];
    this.contacts = [];
    this.cases = [];
  }
}
// ==========================================
// LEAD CRUD
// ==========================================

loadLeads(): void {
  if (this.isLoadingLeads || !this.hasMoreLeads) {
    return;
  }

  this.isLoadingLeads = true;

  this.leadService.getLeads(this.leadPage).subscribe({
    next: (data) => {
      this.leads = [...this.leads, ...data];

      if (data.length < 20) {
        this.hasMoreLeads = false;
      } else {
        this.leadPage++;
      }

      this.isLoadingLeads = false;
    },

    error: (error) => {
      console.error("Lead loading error:", error);
      this.isLoadingLeads = false;
    }
  });
}resetLeads(): void {
  this.leads = [];
  this.leadPage = 1;
  this.hasMoreLeads = true;
  this.isLoadingLeads = false;

  this.loadLeads();
}onLeadScroll(event: any): void {
  const element = event.target;

  const reachedBottom =
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - 10;

  if (reachedBottom) {
    this.loadLeads();
  }
}

createLead(): void {

  this.leadService.createLead(this.newLead).subscribe({

    next: () => {

      alert('Lead created successfully!');

      this.newLead = {
        FirstName: '',
        LastName: '',
        Company: '',
        Email: '',
        Phone: '',
        Status: 'Open - Not Contacted'
      };

      this.resetLeads();

    },

    error: (error) => {
  console.error('FULL LEAD ERROR:', error);

  alert(
    error.error?.message ||
    error.error?.error?.[0]?.message ||
    'Failed to create lead. Check Console.'
  );
}
    

  });

}


editLead(lead: any): void {

  this.editingLead = {
    ...lead
  };

}

cancelLeadEdit(): void {

  this.editingLead = null;

}

updateLead(): void {

  this.leadService.updateLead(
    this.editingLead.Id,
    this.editingLead
  ).subscribe({

    next: () => {

      alert('Lead updated successfully!');

      this.editingLead = null;

      this.resetLeads();

    },

    error: (error) => {

      console.error('Error updating lead:', error);

      alert('Failed to update lead');

    }

  });

}

deleteLead(id: string): void {

  const confirmDelete = confirm(
    'Are you sure you want to delete this lead?'
  );

  if (!confirmDelete) {
    return;
  }

  this.leadService.deleteLead(id).subscribe({

    next: () => {

      alert('Lead deleted successfully!');

      this.resetLeads();

    },

    error: (error) => {

      console.error('Error deleting lead:', error);

      alert('Failed to delete lead');

    }

  });

}
  // ==========================================
  // ACCOUNT CRUD
  // ==========================================

  loadAccounts(): void {
  if (this.isLoadingAccounts || !this.hasMoreAccounts) {
    return;
  }

  this.isLoadingAccounts = true;

  this.accountService.getAccounts(this.accountPage).subscribe({
    next: (data) => {
      this.accounts = [...this.accounts, ...data];

      if (data.length < 20) {
        this.hasMoreAccounts = false;
      } else {
        this.accountPage++;
      }

      this.isLoadingAccounts = false;
    },

    error: (error) => {
      console.error("Account loading error:", error);
      this.isLoadingAccounts = false;
    }
  });
}resetAccounts(): void {
  this.accounts = [];
  this.accountPage = 1;
  this.hasMoreAccounts = true;
  this.isLoadingAccounts = false;

  this.loadAccounts();
}
onAccountScroll(event: any): void {
  const element = event.target;

  const reachedBottom =
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - 10;

  if (reachedBottom) {
    this.loadAccounts();
  }
}
  editAccount(account: any): void {
    this.editingAccount = { ...account };
  }

  cancelEdit(): void {
    this.editingAccount = null;
  }

  updateAccount(): void {

    this.accountService.updateAccount(
      this.editingAccount.Id,
      this.editingAccount
    ).subscribe({

      next: () => {

        alert('Account updated successfully!');

        this.editingAccount = null;

        this.resetAccounts();

      },

      error: (error) => {

        console.error('Error updating account:', error);

        alert('Failed to update account');

      }

    });

  }

  createAccount(): void {

    this.accountService.createAccount(this.newAccount).subscribe({

      next: () => {

        alert('Account created successfully!');

        this.newAccount = {
          Name: '',
          Industry: '',
          Phone: ''
        };

        this.resetAccounts();

      },

      error: (error) => {

        console.error('Error creating account:', error);

        alert('Failed to create account');

      }

    });

  }

  deleteAccount(id: string): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this account?'
    );

    if (!confirmDelete) {
      return;
    }

    this.accountService.deleteAccount(id).subscribe({

      next: () => {

        alert('Account deleted successfully!');

        this.resetAccounts();

      },

      error: (error) => {

        console.error('Error deleting account:', error);

        alert('Failed to delete account');

      }

    });

  }loadContacts(): void {
  if (this.isLoadingContacts || !this.hasMoreContacts) {
    return;
  }

  this.isLoadingContacts = true;

  this.contactService.getContacts(this.contactPage).subscribe({
    next: (data) => {
      this.contacts = [...this.contacts, ...data];

      if (data.length < 20) {
        this.hasMoreContacts = false;
      } else {
        this.contactPage++;
      }

      this.isLoadingContacts = false;
    },

    error: (error) => {
      console.error("Contact loading error:", error);
      this.isLoadingContacts = false;
    }
  });
}resetContacts(): void {
  this.contacts = [];
  this.contactPage = 1;
  this.hasMoreContacts = true;
  this.isLoadingContacts = false;

  this.loadContacts();
}

onContactScroll(event: any): void {
  const element = event.target;

  const reachedBottom =
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - 10;

  if (reachedBottom) {
    this.loadContacts();
  }
}
createContact(): void {

  this.contactService.createContact(this.newContact).subscribe({

    next: () => {

      alert('Contact created successfully!');

      this.newContact = {
        FirstName: '',
        LastName: '',
        Email: '',
        Phone: ''
      };

      this.resetContacts();

    },

    error: (error) => {

      console.error('Error creating contact:', error);

      alert('Failed to create contact');

    }

  });

}
editContact(contact: any): void {

  this.editingContact = {
    ...contact
  };

}cancelContactEdit(): void {

  this.editingContact = null;

}
updateContact(): void {

  this.contactService.updateContact(
    this.editingContact.Id,
    this.editingContact
  ).subscribe({

    next: () => {

      alert('Contact updated successfully!');

      this.editingContact = null;

      this.resetContacts();

    },

    error: (error) => {

      console.error('Error updating contact:', error);

      alert('Failed to update contact');

    }

  });

}deleteContact(id: string): void {

  const confirmDelete = confirm(
    'Are you sure you want to delete this contact?'
  );

  if (!confirmDelete) {
    return;
  }

  this.contactService.deleteContact(id).subscribe({

    next: () => {

      alert('Contact deleted successfully!');

      this.resetContacts();

    },

    error: (error) => {

      console.error('Error deleting contact:', error);

      alert('Failed to delete contact');

    }

  });

}
loadCases(): void {
  this.caseService.getCases().subscribe({
    next: data => this.cases = data,
    error: err => console.error('Error loading cases:', err)
  });
}

createCase(): void {
  this.caseService.createCase(this.newCase).subscribe({
    next: () => {
      alert('Case created successfully');

      this.newCase = {
        Subject: '',
        Description: '',
        Status: 'New',
        Priority: 'Medium',
        Origin: 'Web'
      };

      this.loadCases();
    },
    error: err => console.error('Error creating case:', err)
  });
}

editCase(caseItem: any): void {
  this.editingCase = { ...caseItem };
}

cancelCaseEdit(): void {
  this.editingCase = null;
}

updateCase(): void {
  this.caseService.updateCase(
    this.editingCase.Id,
    this.editingCase
  ).subscribe({
    next: () => {
      alert('Case updated successfully');
      this.editingCase = null;
      this.loadCases();
    },
    error: err => console.error('Error updating case:', err)
  });
}

deleteCase(id: string): void {
  if (confirm('Are you sure you want to delete this case?')) {
    this.caseService.deleteCase(id).subscribe({
      next: () => {
        alert('Case deleted successfully');
        this.loadCases();
      },
      error: err => console.error('Error deleting case:', err)
    });
  }
}
  // ==========================================
  // OPPORTUNITY CRUD
  // ==========================================

  loadOpportunities(): void {

  // Prevent duplicate requests
  if (this.isLoadingOpportunities || !this.hasMoreOpportunities) {
    return;
  }

  this.isLoadingOpportunities = true;

  console.log(
    'Loading opportunities page:',
    this.opportunityPage
  );

  this.opportunityService
    .getOpportunities(this.opportunityPage)
    .subscribe({

      next: (data) => {

        console.log(
          'Opportunities received:',
          data
        );

        // Add new records to existing records
        this.opportunities = [
          ...this.opportunities,
          ...data
        ];

        // If fewer than 20 records are returned,
        // there are no more records to load
        if (data.length < 20) {
          this.hasMoreOpportunities = false;
        } else {
          this.opportunityPage++;
        }

        this.isLoadingOpportunities = false;

      },

      error: (error) => {

        console.error(
          'FULL OPPORTUNITY LOAD ERROR:',
          error
        );

        this.isLoadingOpportunities = false;

      }

    });

}onOpportunityScroll(event: any): void {

  const element = event.target;

  const reachedBottom =
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - 10;

  if (reachedBottom) {

    this.loadOpportunities();

  }

}
resetOpportunities(): void {

  this.opportunities = [];

  this.opportunityPage = 1;

  this.hasMoreOpportunities = true;

  this.isLoadingOpportunities = false;

  this.loadOpportunities();

}
  createOpportunity(): void {

    this.opportunityService
      .createOpportunity(this.newOpportunity)
      .subscribe({

        next: () => {

          alert('Opportunity created successfully!');

          this.newOpportunity = {
            Name: '',
            StageName: '',
            CloseDate: '',
            Amount: null
          };

          this.resetOpportunities();

        },

        error: (error) => {

          console.error('Error creating opportunity:', error);

          alert('Failed to create opportunity');

        }

      });

  }

  editOpportunity(opportunity: any): void {

  console.log('EDIT CLICKED');
  console.log('Selected Opportunity:', opportunity);

  this.editingOpportunity = { ...opportunity };

  console.log('Editing Opportunity:', this.editingOpportunity);

}

  cancelOpportunityEdit(): void {

    this.editingOpportunity = null;

  }
updateOpportunity(): void {

  if (!this.editingOpportunity || !this.editingOpportunity.Id) {
    alert('Opportunity ID is missing');
    return;
  }

  console.log('Updating opportunity:', this.editingOpportunity);

  this.opportunityService
    .updateOpportunity(
      this.editingOpportunity.Id,
      this.editingOpportunity
    )
    .subscribe({

      next: (response) => {

        console.log('Update successful:', response);

        alert('Opportunity updated successfully!');

        this.editingOpportunity = null;

        this.resetOpportunities();
      },

      error: (error) => {

        console.error(
          'FULL UPDATE ERROR:',
          error.error || error
        );

        alert('Failed to update opportunity');

      }

    });

}

  deleteOpportunity(id: string): void {

    const confirmDelete = confirm(
      'Are you sure you want to delete this opportunity?'
    );

    if (!confirmDelete) {
      return;
    }

    this.opportunityService
      .deleteOpportunity(id)
      .subscribe({

        next: () => {

          alert('Opportunity deleted successfully!');

          this.resetOpportunities();

        },

        error: (error) => {

          console.error('Error deleting opportunity:', error);

          alert('Failed to delete opportunity');

        }

      });

  }
loginToSalesforce(): void {
  window.location.href =
    'https://salesforce-crud-app-eejj.onrender.com/auth/login';
}
}