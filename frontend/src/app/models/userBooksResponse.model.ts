import { Book } from './book.model';

export interface AllUserBooksResponse {
  ownedBooks: Book[];
  readBooks: Book[];
}
