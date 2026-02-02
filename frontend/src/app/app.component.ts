import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { SignupDialogComponent } from './components/signup-dialog/signup-dialog.component';
import { DialogService } from './services/dialog.service';
import { AuthService } from './services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from './services/toast.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    RouterLink,
    LoginDialogComponent,
    SignupDialogComponent,
    ToastModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'footnote';
  error = '';
  loginLoading = signal(false);
  signupLoading = signal(false);
  private destroyRef = inject(DestroyRef);

  constructor(
    public authDialogService: DialogService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  submitSignup($event: any) {
    this.signupLoading.set(true);
    this.authService
      .register($event.email, $event.username, $event.password)
      .subscribe({
        next: (res) => {
          console.log('Signup successful', res);
          this.signupLoading.set(false);
          this.authDialogService.hideSignUp();
          this.authDialogService.showLogin();
          this.toastService.success('Signup successful');
        },
        error: (err) => {
          console.log('Signup failed: ', err);
          this.error = err?.error?.error?.message || 'Signup failed';
          this.signupLoading.set(false);
          this.toastService.error(this.error);
        },
      });
  }

  submitLogin($event: { email: string; password: string }) {
    this.loginLoading.set(true);
    this.authService.login($event.email, $event.password).subscribe({
      next: (res) => {
        console.log('Login successful');
        this.loginLoading.set(false);
        this.authDialogService.hideLogin();
        this.toastService.success(`Logged in successfully`);
      },
      error: (err) => {
        console.log('Login failed: ', err?.error?.error?.message);
        this.error = err?.error?.error?.message || 'Login failed';
        this.loginLoading.set(false);
        this.toastService.error(this.error);
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
          this.toastService.success('Logged out successfully');
        },
        error: (err) => {
          console.log('Logout failed: ', err);
          this.error = err?.error?.error?.message || 'Logout failed';
          this.toastService.error(this.error);
        },
      });
  }
}
