import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  private apiUrl =
    'https://salesforce-crud-app-eejj.onrender.com/api/cases';

  constructor(private http: HttpClient) {}

  // Get 20 Cases per page
  getCases(page: number = 1): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}?page=${page}`,
      { withCredentials: true }
    );
  }

  createCase(caseData: any): Observable<any> {
    return this.http.post(
      this.apiUrl,
      caseData,
      { withCredentials: true }
    );
  }

  updateCase(id: string, caseData: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}`,
      caseData,
      { withCredentials: true }
    );
  }

  deleteCase(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}