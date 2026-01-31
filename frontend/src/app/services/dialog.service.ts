import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  signUp($event: { username: string; password: string }) {
    throw new Error('Method not implemented.');
  }
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
