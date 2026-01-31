import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from '../../services/dialog.service';
import { AuthService } from '../../services/auth.service';

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
}
