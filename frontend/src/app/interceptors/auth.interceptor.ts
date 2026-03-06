import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';

let accessToken: string | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);

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
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh')
      ) {
        return http
          .post<{
            success: boolean;
            data: { accessToken: string };
          }>(
            `${environment.apiUrl}/auth/refresh`,
            {},
            { withCredentials: true },
          )
          .pipe(
            switchMap((response) => {
              accessToken = response.data.accessToken;

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });

              return next(retryReq);
            }),
            catchError((refreshError) => {
              accessToken = null;
              router.navigate(['/']);
              return throwError(() => refreshError);
            }),
          );
      }

      return throwError(() => error);
    }),
  );
};

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}
