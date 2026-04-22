import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Templates
  getTemplates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates/`);
  }

  createTemplate(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/templates/`, data);
  }

  // Applications
  getApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/`);
  }

  createApplicant(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/create_applicant/`, data);
  }

  assignForm(applicantId: number, formId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicantId}/assign_form/`, { form_id: formId });
  }

  acceptPrivacy(applicationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/accept_privacy/`, {});
  }

  submitResponses(applicationId: number, responses: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/submit_responses/`, { responses });
  }

  approveApplication(applicationId: number, notes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/approve/`, { notes });
  }

  exportPdf(applicationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/applications/${applicationId}/export_pdf/`, { responseType: 'blob' });
  }
}
