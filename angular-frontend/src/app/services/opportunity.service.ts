import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  private apiUrl =
    'https://salesforce-crud-app-eejj.onrender.com/api/opportunities';

  constructor(private http: HttpClient) {}

  // Get 20 opportunities per page
  getOpportunities(page: number = 1): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?page=${page}`, {
      withCredentials: true
    });
  }

  createOpportunity(opportunity: any): Observable<any> {
    return this.http.post(this.apiUrl, opportunity, {
      withCredentials: true
    });
  }

  updateOpportunity(id: string, opportunity: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, opportunity, {
      withCredentials: true
    });
  }

  deleteOpportunity(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}