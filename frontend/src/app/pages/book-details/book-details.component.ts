import { Component, signal } from '@angular/core';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookEventCardComponent } from '../../components/book-event-card/book-event-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { BooksService } from '../../services/books.service';
import { take } from 'rxjs';
import { Book } from '../../models/book.model';
import { BookEventFormComponent } from '../../components/book-event-form/book-event-form.component';
import { DialogService } from '../../services/dialog.service';
import { BookEvent } from '../../models/book-event.model';
import { AuthService } from '../../services/auth.service';
import { BookEventService } from '../../services/book-event.service';

@Component({
  selector: 'app-book-details',
  imports: [BookCardComponent, BookEventCardComponent, BookEventFormComponent],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss',
})
export class BookDetailsComponent {
  bookId: string | null = null;
  book = signal<Book | null>(null);

  constructor(
    public dialogService: DialogService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private router: Router,
    private booksService: BooksService,
    private authService: AuthService,
    private eventService: BookEventService,
  ) {
    this.bookId = this.route.snapshot.paramMap.get('id');
    if (!this.bookId) {
      this.toastService.error('No book id provided');
      this.router.navigate(['/']);
      return;
    }

    this.getBookWithEvents(this.bookId);
  }

  getBookWithEvents(bookId: string) {
    this.booksService
      .getBookWithEvents(bookId)
      .pipe(take(1))
      .subscribe({
        next: (book) => {
          this.book.set(book);
          //console.log(this.book());
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

  submitBookEvent(event: { event: BookEvent; files: File[] }) {
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (!user || !user.userId) {
          this.toastService.error('You must be logged in to add an event');
          return;
        }

        if (!this.bookId) {
          this.toastService.error('No book id provided');
          return;
        }

        const bookEvent: BookEvent = {
          ...event.event,
          user_id: user.userId,
          book_id: this.bookId,
          created_at: new Date().toISOString(),
        };

        if (!this.book()) {
          this.toastService.error('Book not found');
          return;
        }
        this.eventService
          .addEvent(bookEvent, event.files)
          .pipe(take(1))
          .subscribe({
            next: (event) => {
              this.toastService.success('Event added!');
              if (!this.bookId) {
                this.toastService.error('No book id provided');
                this.router.navigate(['/']);
                return;
              }
              this.getBookWithEvents(this.bookId);
            },
            error: (err) =>
              this.toastService.error(err.error?.error?.message ?? 'Error'),
          });
      },
      error: (err) =>
        this.toastService.error(err.error?.error?.message ?? 'Error'),
    });
  }
}
