// src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { LoginResponse } from '../models/loginResponse.model';
import { User } from '../models/user.model';
import {
  BehaviorSubject,
  Observable,
  tap,
  catchError,
  of,
  switchMap,
  map,
} from 'rxjs';
import {
  setAccessToken,
  getAccessToken,
} from '../interceptors/auth.interceptor';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isInitializing = new BehaviorSubject<boolean>(true);
  public isInitializing$ = this.isInitializing.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.refreshToken()
      .pipe(
        switchMap(() => {
          return this.getMe();
        }),
        tap((user) => {
          this.currentUserSubject.next(user.data);
          this.isInitializing.next(false);
        }),
        catchError((error) => {
          this.isInitializing.next(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  // Getter az access tokenhez
  get accessToken(): string | null {
    return getAccessToken();
  }

  getMe(): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(
      `${this.apiUrl}/auth/me`,
    );
  }

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          setAccessToken(response.data.accessToken);
        }),
        switchMap(() => this.getMe()),
        tap((user) => {
          this.currentUserSubject.next(user.data);
        }),
        map(() => undefined),
      );
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/register`,
      { email, username, password },
      { withCredentials: true },
    );
  }

  logout(): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          setAccessToken(null);
          this.currentUserSubject.next(null);
        }),
        catchError((error) => {
          setAccessToken(null);
          this.currentUserSubject.next(null);
          return of(undefined);
        }),
        map(() => undefined),
      );
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          setAccessToken(response.data.accessToken);
        }),
      );
  }

  isLoggedIn(): boolean {
    return getAccessToken() !== null;
  }
}
