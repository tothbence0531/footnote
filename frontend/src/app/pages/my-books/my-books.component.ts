import { Component, signal } from '@angular/core';
import { DragscrollDirective } from '../../directives/dragscroll.directive';
import { BooksService } from '../../services/books.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Book } from '../../models/book.model';
import { environment } from '../../../environments/environment.dev';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
@Component({
  selector: 'app-my-books',
  imports: [DragscrollDirective, RouterLink, Button],
  templateUrl: './my-books.component.html',
  styleUrl: './my-books.component.scss',
})
export class MyBooksComponent {
  API_URL = environment.apiUrl;
  ownedBooks = signal<Book[]>([]);
  readBooks = signal<Book[]>([]);

  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {
    this.getOwnedBooksFromBackend();
  }

  getOwnedBooksFromBackend() {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.booksService.getAllBooksForUser().subscribe((response) => {
            this.ownedBooks.set(response.ownedBooks);
            this.readBooks.set(response.readBooks);
          });
        }
      },
      error: (error) => {
        this.toastService.error(error);
      },
    });
  }

  onImageError(book: any) {
    book.imageError = true;
  }

  deleteBook(book: Book) {
    this.booksService.deleteBook(book.id).subscribe({
      next: () => {
        this.toastService.success('Book deleted');
        this.getOwnedBooksFromBackend();
      },
      error: (error) => {
        this.toastService.error(error.error?.error?.message ?? 'Error');
      },
    });
  }
}
