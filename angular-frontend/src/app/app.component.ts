import { ContactService } from './services/contact.service';
import { LeadService } from './services/lead.service';
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

  // Account Properties
  accounts: any[] = [];

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

// Lead Properties
leads: any[] = [];

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

editingContact: any = null;
editingLead: any = null;
  

  constructor(
  private accountService: AccountService,
  private opportunityService: OpportunityService,
  private leadService: LeadService,
  private contactService: ContactService

) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  onObjectChange(): void {

  console.log('Selected object:', this.selectedObject);

  if (this.selectedObject === 'Account') {

    this.loadAccounts();

  } else if (this.selectedObject === 'Opportunity') {

    this.loadOpportunities();

  } else if (this.selectedObject === 'Lead') {

    this.loadLeads();

  } else if (this.selectedObject === 'Contact') {

    this.loadContacts();

  } else {

    this.accounts = [];
    this.opportunities = [];
    this.leads = [];
    this.contacts = [];

  }

}
// ==========================================
// LEAD CRUD
// ==========================================

loadLeads(): void {

  this.leadService.getLeads().subscribe({

    next: (data) => {
      this.leads = data;
    },

    error: (error) => {
      console.error('Error loading leads:', error);
    }

  });

}
loadContacts(): void {

  this.contactService.getContacts().subscribe({

    next: (data) => {

      this.contacts = data;

    },

    error: (error) => {

      console.error('Error loading contacts:', error);

    }

  });

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

      this.loadLeads();

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

      this.loadLeads();

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

      this.loadLeads();

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

    this.accountService.getAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });

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

        this.loadAccounts();

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

        this.loadAccounts();

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

        this.loadAccounts();

      },

      error: (error) => {

        console.error('Error deleting account:', error);

        alert('Failed to delete account');

      }

    });

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

      this.loadContacts();

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

      this.loadContacts();

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

      this.loadContacts();

    },

    error: (error) => {

      console.error('Error deleting contact:', error);

      alert('Failed to delete contact');

    }

  });

}
  // ==========================================
  // OPPORTUNITY CRUD
  // ==========================================

  loadOpportunities(): void {

    this.opportunityService.getOpportunities().subscribe({

      next: (data) => {

        this.opportunities = data;

      },

      error: (error) => {

        console.error('Error loading opportunities:', error);

      }

    });

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

          this.loadOpportunities();

        },

        error: (error) => {

          console.error('Error creating opportunity:', error);

          alert('Failed to create opportunity');

        }

      });

  }

  editOpportunity(opportunity: any): void {

    this.editingOpportunity = {
      ...opportunity
    };

  }

  cancelOpportunityEdit(): void {

    this.editingOpportunity = null;

  }

  updateOpportunity(): void {

    this.opportunityService
      .updateOpportunity(
        this.editingOpportunity.Id,
        this.editingOpportunity
      )
      .subscribe({

        next: () => {

          alert('Opportunity updated successfully!');

          this.editingOpportunity = null;

          this.loadOpportunities();

        },

        error: (error) => {

          console.error('Error updating opportunity:', error);

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

          this.loadOpportunities();

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