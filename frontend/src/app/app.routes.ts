import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AddBookComponent } from './pages/add-book/add-book.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { MyBooksComponent } from './pages/my-books/my-books.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ScanQrComponent } from './pages/scan-qr/scan-qr.component';
import { BookDetailsComponent } from './pages/book-details/book-details.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-book', component: AddBookComponent, canActivate: [authGuard] },
  { path: 'discover', component: DiscoverComponent },
  { path: 'my-books', component: MyBooksComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'scan-qr', component: ScanQrComponent },
  { path: 'book/:id', component: BookDetailsComponent },
  { path: '**', redirectTo: '' },
];
