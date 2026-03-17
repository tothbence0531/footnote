import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from '../../services/dialog.service';
import { AuthService } from '../../services/auth.service';
import { Web3Service } from '../../services/web3.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, DialogModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  logout = output();

  constructor(
    private authDialogService: DialogService,
    private AuthService: AuthService,
    public web3Service: Web3Service,
    private toastService: ToastService,
  ) {}
  showDialog() {
    this.authDialogService.showLogin();
  }
  visible = false;

  isLoggedIn() {
    return this.AuthService.isLoggedIn();
  }

  onLogout() {
    this.logout.emit();
  }

  disconnectWallet() {
    this.web3Service.disconnect();
    this.toastService.success('Wallet disconnected');
  }

  async connectWallet() {
    try {
      const address = await this.web3Service.connect();
      this.toastService.success(
        `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      );
    } catch (err: any) {
      this.toastService.error(err.message ?? 'Wallet connection failed');
    }
  }
}
