import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, switchMap, map, take } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return authService.isInitializing$.pipe(
    filter((isInitializing) => !isInitializing),
    take(1),
    switchMap(() => authService.currentUser$),
    take(1),
    map((user) => {
      if (user) {
        return true;
      }

      router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      toastService.error('You must be logged in to access this page');
      return false;
    }),
  );
};
