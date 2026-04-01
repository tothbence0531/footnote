import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Badge } from '../models/badge.model';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  constructor(
    private http: HttpClient,
    private toastService: ToastService,
  ) {}

  getMyBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${environment.apiUrl}/badges/my`);
  }
  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(`${environment.apiUrl}/badges/all`);
  }

  async addAllBadgesToMetaMask(badges: Badge[]): Promise<void> {
    if (!window.ethereum) return;

    for (const badge of badges) {
      try {
        const result = await (window.ethereum as any).request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC1155',
            options: {
              address: environment.contractAddress,
              tokenId: badge.id.toString(),
            },
          },
        });

        if (!result) {
          this.toastService.info(
            `Manual import: Contract: ${environment.contractAddress}, Token ID: ${badge.id}`,
          );
        }
      } catch (error) {
        this.toastService.error("Couldn't add badge to MetaMask");
      }
    }
  }
}
