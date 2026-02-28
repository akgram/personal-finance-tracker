import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if(res.access_token) {
          localStorage.setItem('token', res.access_token); // cuva se kljuc

          localStorage.setItem('userEmail', email);
        }
      })
    );
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
  }
}