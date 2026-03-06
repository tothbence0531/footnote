import { Component, signal } from '@angular/core';
import { DragscrollDirective } from '../../directives/dragscroll.directive';
import { BooksService } from '../../services/books.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Book } from '../../models/book.model';
import { environment } from '../../../environments/environment.dev';
@Component({
  selector: 'app-my-books',
  imports: [DragscrollDirective],
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
}
