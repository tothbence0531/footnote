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
import { passwordMatchValidator } from '../../validators/password-match.validator';

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
  loading = input<boolean>(false);

  submitSignup = output<{ username: string; password: string }>();

  constructor(private AuthDialogService: DialogService) {}

  form = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      username: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern('^[a-zA-Z0-9_]+$'),
        ],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
        ],
      }),
      passwordConfirm: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
        ],
      }),
    },
    { validators: passwordMatchValidator },
  );

  /**
   * returns the form controls for signing up
   */
  get fc() {
    return this.form.controls;
  }

  close() {
    this.visibleChange.emit(false);
  }

  openLogin() {
    this.close();
    this.AuthDialogService.showLogin();
  }

  submit() {
    if (this.form.invalid) return;
    this.submitSignup.emit(this.form.getRawValue());
  }
}
