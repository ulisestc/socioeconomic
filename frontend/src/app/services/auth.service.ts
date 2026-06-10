import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
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
      }),
      switchMap(() => this.getProfile()) // Obtener el perfil inmediatamente tras login
    );
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/me/`).pipe(
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

  get user$() {
    return this.userSubject.asObservable();
  }
}
