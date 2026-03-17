import { Injectable } from '@angular/core';
import { BookEvent } from '../models/book-event.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class BookEventService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addEvent(
    event: BookEvent,
    files: File[],
    signature?: string,
    walletAddress?: string,
  ): Observable<BookEvent> {
    const formData = new FormData();
    formData.append('book_id', event.book_id);
    formData.append('location', event.location);
    formData.append('description', event.description);
    formData.append('rating', event.rating.toString());
    formData.append('created_at', event.created_at);

    if (signature) formData.append('signature', signature);
    if (walletAddress) formData.append('wallet_address', walletAddress);

    files.forEach((file) => formData.append('images', file));

    return this.http.post<BookEvent>(`${this.API_URL}/events`, formData);
  }
}
