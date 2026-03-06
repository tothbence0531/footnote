import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { AllUserBooksResponse } from '../models/userBooksResponse.model';
import { environment } from '../../environments/environment.dev';
import { Book } from '../models/book.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
  ) {}

  getAllBooksForUser() {
    return this.http.get<AllUserBooksResponse>(
      `${this.API_URL}/books/user/all`,
    );
  }

  addOwnedBook(book: Book) {
    return this.http.post<Book>(`${this.API_URL}/books`, book);
  }

  uploadCoverImage(
    file: File,
  ): Observable<{ filename: string; coverUrl: string }> {
    const formData = new FormData();
    formData.append('cover', file);
    return this.http.post<{ filename: string; coverUrl: string }>(
      `${this.API_URL}/books/upload-cover`,
      formData,
    );
  }
}
