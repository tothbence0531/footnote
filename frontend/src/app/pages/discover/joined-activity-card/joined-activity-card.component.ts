import { Component, input } from '@angular/core';
import { Activity } from '../../../models/activity.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-joined-activity-card',
  imports: [DatePipe],
  templateUrl: './joined-activity-card.component.html',
  styleUrl: './joined-activity-card.component.scss',
})
export class JoinedActivityCardComponent {
  activity = input.required<Activity>();
}
