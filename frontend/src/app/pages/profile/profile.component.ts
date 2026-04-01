import { Component, DestroyRef, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { BadgeService } from '../../services/badge.service';
import { Badge } from '../../models/badge.model';
import { Web3Service } from '../../services/web3.service';
import { Me, UserProfile } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment.dev';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user = signal<Me | null>(null);
  userProfile = signal<UserProfile | null>(null);
  earnedBadges = signal<Badge[]>([]);
  allBadges = signal<Badge[]>([]);
  isLoading = signal(true);
  readonly API_URL = environment.apiUrl;
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private badgeService: BadgeService,
    public web3Service: Web3Service,
    private toastService: ToastService,
  ) {
    this.authService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.user.set(user);
    });

    forkJoin({
      profile: this.authService.getUserProfile(),
      earned: this.badgeService.getMyBadges(),
      all: this.badgeService.getAllBadges(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ profile, earned, all }) => {
          this.userProfile.set(profile);
          this.earnedBadges.set(earned);
          this.allBadges.set(all);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toastService.error('Loading data failed');
        },
      });
  }

  hasEarned(badgeId: number): boolean {
    return this.earnedBadges().some((b) => b.id === badgeId);
  }

  getEarned(badgeId: number): Badge | undefined {
    return this.earnedBadges().find((b) => b.id === badgeId);
  }

  isOnChain(badgeId: number): boolean {
    return !!this.getEarned(badgeId)?.chain_tx_hash;
  }

  getEtherscanUrl(badgeId: number): string {
    const tx = this.getEarned(badgeId)?.chain_tx_hash;
    return `https://sepolia.etherscan.io/tx/${tx}`;
  }

  importBadgesToMetaMask() {
    this.badgeService.addAllBadgesToMetaMask(this.earnedBadges());
  }

  async connectWallet() {
    try {
      await this.web3Service.connect();
      this.toastService.success('Wallet connected!');
    } catch {
      this.toastService.error('Wallet connection failed');
    }
  }

  logout() {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Logout successful', res);
          this.toastService.success('Logged out successfully');
        },
        error: (err) => {
          console.log('Logout failed: ', err);
          const error = err?.error?.error?.message || 'Logout failed';
          this.toastService.error(error);
        },
      });
  }
}
