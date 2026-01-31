// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';

// Token tárolás globális változóban (NEM service-ben!)
let accessToken: string | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 1. Add hozzá az access token-t ha van
  if (
    accessToken &&
    !req.url.includes('/auth/login') &&
    !req.url.includes('/auth/register')
  ) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 2. Ha 401 és nem auth endpoint
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        // Refresh token próbálkozás
        const http = inject(HttpClient);

        return http
          .post<{
            success: boolean;
            data: { accessToken: string };
          }>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
          .pipe(
            switchMap((response) => {
              // Új token mentése
              accessToken = response.data.accessToken;

              // Retry az eredeti request
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });

              return next(retryReq);
            }),
            catchError((refreshError) => {
              // Refresh is lejárt → logout
              accessToken = null;
              router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
      }

      return throwError(() => error);
    }),
  );
};

// Export függvények a service számára
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}
