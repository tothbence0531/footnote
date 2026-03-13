import { Routes } from '@angular/router';
import { ScanQrComponent } from './pages/scan-qr/scan-qr.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'add-book',
    loadComponent: () =>
      import('./pages/add-book/add-book.component').then(
        (m) => m.AddBookComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'discover',
    loadComponent: () =>
      import('./pages/discover/discover.component').then(
        (m) => m.DiscoverComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'my-books',
    loadComponent: () =>
      import('./pages/my-books/my-books.component').then(
        (m) => m.MyBooksComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
    canActivate: [authGuard],
  },
  { path: 'scan-qr', component: ScanQrComponent },
  {
    path: 'book/:id',
    loadComponent: () =>
      import('./pages/book-details/book-details.component').then(
        (m) => m.BookDetailsComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
