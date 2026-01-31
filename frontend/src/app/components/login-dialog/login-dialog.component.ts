import { Component, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DialogService } from '../../services/dialog.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-login-dialog',
  imports: [
    DialogModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    IconField,
    InputIcon,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  loading = signal(false);
  submitLogin = output<{ email: string; password: string }>();

  constructor(private authDialogService: DialogService) {}

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  close() {
    this.visibleChange.emit(false);
  }

  openRegister() {
    this.close();
    this.authDialogService.showSignUp();
  }

  submit() {
    if (this.form.invalid) return;
    this.submitLogin.emit(this.form.getRawValue());
    this.loading.set(true);
  }
}
