import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AddBookComponent } from './pages/add-book/add-book.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { MyBooksComponent } from './pages/my-books/my-books.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ScanQrComponent } from './pages/scan-qr/scan-qr.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-book', component: AddBookComponent },
  { path: 'discover', component: DiscoverComponent },
  { path: 'my-books', component: MyBooksComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'scan-qr', component: ScanQrComponent },
  { path: '**', redirectTo: '' },
];
