import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../models/activity.model';
import { environment } from '../../environments/environment.dev';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFeed(limit = 50): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.API_URL}/activity/feed`, {
      params: { limit: limit.toString() },
    });
  }

  getUserFeed(userId: string, limit = 50): Observable<Activity[]> {
    return this.http.get<Activity[]>(
      `${this.API_URL}/activity/feed/user/${userId}`,
      {
        params: { limit: limit.toString() },
      },
    );
  }
}
