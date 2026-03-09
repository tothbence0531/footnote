import { Component, effect, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { BookEvent } from '../../models/book-event.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-book-event-card',
  imports: [RatingModule, FormsModule, DatePipe],
  templateUrl: './book-event-card.component.html',
  styleUrl: './book-event-card.component.scss',
})
export class BookEventCardComponent {
  bookEvent = input.required<BookEvent>();
  bookRating = 0;

  constructor() {
    effect(() => {
      if (!this.bookEvent()) {
        return;
      }
      this.bookRating = this.bookEvent()?.rating;
    });
  }
}
