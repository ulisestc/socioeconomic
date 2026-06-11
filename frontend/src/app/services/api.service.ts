import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Templates
  getTemplates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates/`);
  }

  createTemplate(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/templates/`, data);
  }

  updateTemplate(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/templates/${id}/`, data);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/templates/${id}/`);
  }

  // Applications
  getApplications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/`);
  }

  getApplicants(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/applicants/`);
  }

  createApplicant(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/create_applicant/`, data);
  }

  updateApplicant(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/applications/${id}/manage_applicant/`, data);
  }

  deleteApplicant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/applications/${id}/manage_applicant/`);
  }

  assignForm(applicantId: number, formId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicantId}/assign_form/`, { form_id: formId });
  }

  acceptPrivacy(): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/accept_privacy/`, {});
  }

  submitResponses(applicationId: number, responses: any[], isDraft: boolean = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/submit_responses/`, { responses, is_draft: isDraft });
  }

  approveApplication(applicationId: number, notes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/approve/`, { notes });
  }

  rejectApplication(applicationId: number, notes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${applicationId}/reject/`, { notes });
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/reset_password/`, { email });
  }

  changeCredentials(newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/change_credentials/`, { new_password: newPassword });
  }

  exportPdf(applicationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/applications/${applicationId}/export_pdf/`, { responseType: 'blob' });
  }

  uploadAttachment(applicationId: number, questionKey: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('application', applicationId.toString());
    formData.append('question_key', questionKey);
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/attachments/`, formData);
  }
}
