import { Component, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from '../../services/dialog.service';
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
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-signup-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    FloatLabelModule,
    IconField,
    InputIcon,
    PasswordModule,
    InputTextModule,
  ],
  templateUrl: './signup-dialog.component.html',
  styleUrl: './signup-dialog.component.scss',
})
export class SignupDialogComponent {
  visible = input<boolean>(false);
  visibleChange = output<boolean>();
  loading = signal(false);

  submitLogin = output<{ username: string; password: string }>();

  constructor(private AuthDialogService: DialogService) {}

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    passwordConfirm: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });

  close() {
    this.visibleChange.emit(false);
  }

  openLogin() {
    this.close();
    this.AuthDialogService.showLogin();
  }

  submit() {
    if (this.form.invalid) return;
    this.submitLogin.emit(this.form.getRawValue());
    this.loading.set(true);
  }
}
