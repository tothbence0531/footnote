import { Component, effect, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { BookEvent } from '../../models/book-event.model';
import { DatePipe } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { environment } from '../../../environments/environment.dev';

interface GalleriaImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
}

@Component({
  selector: 'app-book-event-card',
  imports: [RatingModule, FormsModule, DatePipe, GalleriaModule],
  templateUrl: './book-event-card.component.html',
  styleUrl: './book-event-card.component.scss',
})
export class BookEventCardComponent {
  bookEvent = input.required<BookEvent>();
  bookRating = 0;
  images = signal<GalleriaImage[]>([]);
  readonly API_URL = environment.apiUrl;

  constructor() {
    effect(() => {
      if (!this.bookEvent()) {
        return;
      }
      this.bookRating = this.bookEvent()?.rating;
      this.images.set([]);

      const img = this.bookEvent()?.images?.map((image) => ({
        itemImageSrc: this.API_URL + image.image_url,
        thumbnailImageSrc: this.API_URL + image.image_url,
      }));

      this.images.set(img || []);
    });
  }
}
