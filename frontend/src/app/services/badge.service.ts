import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Badge } from '../models/badge.model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  constructor(private http: HttpClient) {}

  getMyBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${environment.apiUrl}/badges/my`);
  }
  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${environment.apiUrl}/badges/all`);
  }
}
