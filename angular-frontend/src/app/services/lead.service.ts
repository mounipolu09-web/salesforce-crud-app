import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeadService {

  private apiUrl =
    'https://salesforce-crud-app-eejj.onrender.com/api/leads';

  constructor(private http: HttpClient) {}

  getLeads(): Observable<any[]> {
    return this.http.get<any[]>(
      this.apiUrl,
      { withCredentials: true }
    );
  }

  createLead(lead: any): Observable<any> {
    return this.http.post(
      this.apiUrl,
      lead,
      { withCredentials: true }
    );
  }

  updateLead(id: string, lead: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}`,
      lead,
      { withCredentials: true }
    );
  }

  deleteLead(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}