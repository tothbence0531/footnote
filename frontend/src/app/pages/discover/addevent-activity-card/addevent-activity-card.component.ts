import { Component, input } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import { Activity } from '../../../models/activity.model';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { DragscrollDirective } from '../../../directives/dragscroll.directive';

@Component({
  selector: 'app-addevent-activity-card',
  imports: [
    DatePipe,
    RouterLink,
    RatingModule,
    FormsModule,
    DragscrollDirective,
  ],
  templateUrl: './addevent-activity-card.component.html',
  styleUrl: './addevent-activity-card.component.scss',
})
export class AddeventActivityCardComponent {
  readonly API_URL = environment.apiUrl;

  activity = input.required<Activity>();
}
