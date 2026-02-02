import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly BASE_TOAST_DURATION = 3000;

  constructor(private messageService: MessageService) {}

  success(detail: string, summary: string = 'Success') {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: this.BASE_TOAST_DURATION,
    });
  }

  info(detail: string, summary: string = 'Info') {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: this.BASE_TOAST_DURATION,
    });
  }

  warn(detail: string, summary: string = 'Warning') {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: this.BASE_TOAST_DURATION,
    });
  }

  error(detail: string, summary: string = 'Error') {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: this.BASE_TOAST_DURATION,
    });
  }
}
