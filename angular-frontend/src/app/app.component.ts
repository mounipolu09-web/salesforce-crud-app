import { Component, OnInit } from '@angular/core';
import { AccountService } from './services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  accounts: any[] = [];

  newAccount = {
    Name: '',
    Industry: '',
    Phone: ''
  };
editingAccount: any = null;
  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

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
      next: (response) => {
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
}