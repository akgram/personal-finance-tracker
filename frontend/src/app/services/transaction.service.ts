import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/transactions';

  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }
  // salje se token kroz header

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, this.getHeaders());
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  update(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }
}