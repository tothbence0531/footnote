import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';

@Component({
  selector: 'app-book-event-card',
  imports: [RatingModule, FormsModule],
  templateUrl: './book-event-card.component.html',
  styleUrl: './book-event-card.component.scss',
})
export class BookEventCardComponent {
  bookRating = 4;
}
