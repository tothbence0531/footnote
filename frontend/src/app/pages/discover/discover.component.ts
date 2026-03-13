import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { ActivityService } from '../../services/activity.service';
import { Activity } from '../../models/activity.model';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { AddbookActivityCardComponent } from './addbook-activity-card/addbook-activity-card.component';
import { AddeventActivityCardComponent } from './addevent-activity-card/addevent-activity-card.component';
import { JoinedActivityCardComponent } from './joined-activity-card/joined-activity-card.component';

@Component({
  selector: 'app-discover',
  imports: [
    RouterModule,
    RatingModule,
    FormsModule,
    AddbookActivityCardComponent,
    AddeventActivityCardComponent,
    JoinedActivityCardComponent,
  ],
  templateUrl: './discover.component.html',
  styleUrl: './discover.component.scss',
})
export class DiscoverComponent {
  private destroyRef = inject(DestroyRef);
  feed: Activity[] = [];
  isLoading = true;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
  ) {
    effect(() => {
      this.authService.isInitializing$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((isInitializing) => {
          if (!isInitializing) {
            this.getFeed();
          }
        });
    });
  }

  getFeed() {
    this.activityService
      .getFeed()
      .pipe(take(1))
      .subscribe({
        next: (feed) => {
          this.feed = feed;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
