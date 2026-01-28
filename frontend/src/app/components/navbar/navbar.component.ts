import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, DialogModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private authDialogService: DialogService) {}
  showDialog() {
    this.authDialogService.showLogin();
  }
  visible = false;
}
