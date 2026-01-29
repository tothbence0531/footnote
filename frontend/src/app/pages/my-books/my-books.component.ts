import { Component } from '@angular/core';
import { BookCardComponent } from '../../components/book-card/book-card.component';
import { BookEventCardComponent } from '../../components/book-event-card/book-event-card.component';

@Component({
  selector: 'app-my-books',
  imports: [BookCardComponent, BookEventCardComponent],
  templateUrl: './my-books.component.html',
  styleUrl: './my-books.component.scss',
})
export class MyBooksComponent {}
