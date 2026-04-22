import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      this.userSubject.next(JSON.parse(user));
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/token/`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh);
        // Decode JWT to get user role/info or fetch from another endpoint
        // For MVP, we'll fetch user info separately if needed or just store role
      })
    );
  }

  // Helper to fetch current user profile
  getProfile(): Observable<any> {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('access')}` };
    return this.http.get(`${this.apiUrl}/applications/me/`, { headers }).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.userSubject.next(null);
  }

  getToken() {
    return localStorage.getItem('access');
  }

  get user$() {
    return this.userSubject.asObservable();
  }
}
