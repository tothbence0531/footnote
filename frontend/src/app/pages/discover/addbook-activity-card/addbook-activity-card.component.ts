import { Component, effect, input } from '@angular/core';
import { Activity } from '../../../models/activity.model';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment.dev';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-addbook-activity-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './addbook-activity-card.component.html',
  styleUrl: './addbook-activity-card.component.scss',
})
export class AddbookActivityCardComponent {
  readonly API_URL = environment.apiUrl;

  activity = input.required<Activity>();
}
