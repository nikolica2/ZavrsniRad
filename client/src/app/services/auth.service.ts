import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = 'https://localhost:5001/api/auth';

  currentUser = signal<{ token: string; id: string; displayName: string; role: string } | null>(
    null,
  );

  constructor() {
    const stored = localStorage.getItem('user');
    if (stored) this.currentUser.set(JSON.parse(stored));
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(this.baseUrl + '/login', { email, password });
  }

  register(displayName: string, email: string, password: string) {
    return this.http.post<{ token: string }>(this.baseUrl + '/register', {
      displayName,
      email,
      password,
    });
  }

  setUser(token: string) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const user = {
      token,
      id: payload['nameid'],
      displayName: payload['unique_name'],
      role: payload['role'], // ← ovo je ispravno ime
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAdmin() {
    return this.currentUser()?.role === 'Admin';
  }
}
