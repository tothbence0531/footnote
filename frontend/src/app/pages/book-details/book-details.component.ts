import { Component, signal } from '@angular/core';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookEventCardComponent } from '../../components/book-event-card/book-event-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { BooksService } from '../../services/books.service';
import { take } from 'rxjs';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-details',
  imports: [BookCardComponent, BookEventCardComponent],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss',
})
export class BookDetailsComponent {
  bookId: string | null = null;
  book = signal<Book | null>(null);

  constructor(
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private booksService: BooksService,
  ) {
    this.bookId = this.route.snapshot.paramMap.get('id');
    if (!this.bookId) {
      this.toastService.error('No book id provided');
      this.router.navigate(['/']);
      return;
    }

    this.booksService
      .getBookWithEvents(this.bookId)
      .pipe(take(1))
      .subscribe({
        next: (book) => {
          this.book.set(book);
          if (!this.book) {
            this.toastService.error('Book not found');
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.toastService.error(
            error.error?.error?.message || 'Something went wrong',
          );
          this.router.navigate(['/']);
        },
      });
  }
}
