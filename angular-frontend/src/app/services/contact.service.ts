import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl =
    'https://salesforce-crud-app-eejj.onrender.com/api/contacts';

  constructor(private http: HttpClient) {}

  // Get 20 Contacts per page
  getContacts(page: number = 1): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}?page=${page}`,
      { withCredentials: true }
    );
  }

  createContact(contact: any): Observable<any> {
    return this.http.post(
      this.apiUrl,
      contact,
      { withCredentials: true }
    );
  }

  updateContact(id: string, contact: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}`,
      contact,
      { withCredentials: true }
    );
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}