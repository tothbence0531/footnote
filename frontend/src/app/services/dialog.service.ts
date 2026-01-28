import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  loginVisible = signal(false);
  signUpVisible = signal(false);

  constructor() {}

  showLogin() {
    this.loginVisible.set(true);
  }

  hideLogin() {
    this.loginVisible.set(false);
  }

  showSignUp() {
    this.signUpVisible.set(true);
  }

  hideSignUp() {
    this.signUpVisible.set(false);
  }
}
