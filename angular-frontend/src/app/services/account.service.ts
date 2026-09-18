import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = 'https://salesforce-crud-app-eejj.onrender.com/api/accounts'; 
 
  constructor(private http: HttpClient) {} 
 
  getAccounts(): Observable<any> { 
    return this.http.get(this.apiUrl, { 
      withCredentials: true 
    }); 
  } 
 
  createAccount(account: any): Observable<any> { 
    return this.http.post(this.apiUrl, account, { 
      withCredentials: true 
    }); 
  } 
 
  updateAccount(id: string, account: any): Observable<any> { 
    return this.http.patch(`${this.apiUrl}/${id}`, account, { 
      withCredentials: true 
    }); 
  } 
 
  deleteAccount(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/${id}`, { 
      withCredentials: true 
    }); 
  } 
} 