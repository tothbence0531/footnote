import { Component, DestroyRef, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { SignupDialogComponent } from './components/signup-dialog/signup-dialog.component';
import { DialogService } from './services/dialog.service';
import { AuthService } from './services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    RouterLink,
    LoginDialogComponent,
    SignupDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'footnote';
  error = '';
  private destroyRef = inject(DestroyRef);

  constructor(
    public authDialogService: DialogService,
    private authService: AuthService,
  ) {}

  submitSignup($event: any) {
    this.authService
      .register($event.email, $event.username, $event.password)
      .subscribe({
        next: (res) => {
          console.log('Signup successful', res);
        },
        error: (err) => {
          console.log('Signup failed: ', err);
          this.error = err?.error?.error?.message || 'Signup failed';
        },
      });
  }

  submitLogin($event: { email: string; password: string }) {
    this.authService.login($event.email, $event.password).subscribe({
      next: (res) => {
        console.log('Login successful', res);
      },
      error: (err) => {
        console.log('Login failed: ', err);
        this.error = err?.error?.error?.message || 'Login failed';
      },
    });
  }

  onLogout() {
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('Logout successful', res);
        },
        error: (err) => {
          console.log('Logout failed: ', err);
          this.error = err?.error?.error?.message || 'Logout failed';
        },
      });
  }
}
