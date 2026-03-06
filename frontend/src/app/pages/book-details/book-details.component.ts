import { Component } from '@angular/core';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookEventCardComponent } from '../../components/book-event-card/book-event-card.component';

@Component({
  selector: 'app-book-details',
  imports: [BookCardComponent, BookEventCardComponent],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss',
})
export class BookDetailsComponent {}
