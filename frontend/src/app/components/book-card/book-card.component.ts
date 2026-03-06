import { Component, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { Book } from '../../models/book.model';
import { environment } from '../../../environments/environment.dev';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { BookEvent } from '../../models/book-event.model';
import { DatePipe } from '@angular/common';
import { BookmarkGeneratorService } from '../../services/bookmark-generator.service';

@Component({
  selector: 'app-book-card',
  imports: [RatingModule, FormsModule, DatePipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
})
export class BookCardComponent {
  readonly API_URL = environment.apiUrl;
  book = input.required<Book | null>();
  ownerEvent = signal<BookEvent | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private bookmarkGeneratorService: BookmarkGeneratorService,
  ) {
    effect(() => {
      if (!this.book()) {
        return;
      }
      this.ownerEvent.set(this.book()?.events?.at(0) || null);
    });
  }

  downloadQrCode() {
    if (!this.book()) {
      return;
    }
    this.bookmarkGeneratorService
      .generateBookmark(this.book()!.id, '/assets/bookmark.png')
      .then(() => {
        this.toastService.success('Bookmark generated successfully');
      })
      .catch((error) => {
        this.toastService.error(error);
      });
  }
}
