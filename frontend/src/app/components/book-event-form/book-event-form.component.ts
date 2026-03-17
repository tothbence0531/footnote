import { Component, inject, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from '../../services/dialog.service';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TextareaModule } from 'primeng/textarea';
import { RatingModule } from 'primeng/rating';
import { FileUploadModule } from 'primeng/fileupload';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookEvent } from '../../models/book-event.model';
import { ToastService } from '../../services/toast.service';
import { Web3Service } from '../../services/web3.service';
import { environment } from '../../../environments/environment.dev';

const NONCE_ABI = ['function nonces(address) view returns (uint256)'];

@Component({
  selector: 'app-book-event-form',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    TextareaModule,
    RatingModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './book-event-form.component.html',
  styleUrl: './book-event-form.component.scss',
})
export class BookEventFormComponent {
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  onSubmit = output<{
    event: BookEvent;
    files: File[];
    signature?: string;
    walletAddress?: string;
  }>();
  bookId = input<string | null>(null);

  private fb = inject(FormBuilder);
  isSigning = signal(false);
  userId = input<string | null>(null);
  uploadedFiles: any[] = [];

  constructor(
    private dialogService: DialogService,
    private toastService: ToastService,
    private web3Service: Web3Service,
  ) {}

  addEventForm = this.fb.group({
    location: ['', Validators.required],
    description: ['', Validators.required],
    rating: [0, Validators.required],
  });

  get fc() {
    return this.addEventForm.controls;
  }

  close() {
    this.addEventForm.reset();
    this.uploadedFiles = [];
    this.dialogService.hideBookEvent();
  }

  async save() {
    if (this.addEventForm.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    if (this.fc.rating.value === 0) {
      this.toastService.error('Provide a rating for the book');
      return;
    }

    if (!this.uploadedFiles.length || this.uploadedFiles.length > 3) {
      this.toastService.error(
        'Please upload at least one, but not more than 3 images',
      );
      return;
    }

    const eventData = this.addEventForm.value as BookEvent;

    if (this.web3Service.isConnected() && this.bookId()) {
      try {
        this.isSigning.set(true);

        const createdAt = new Date().toISOString();
        const hashInput = `${this.bookId()}::${this.userId()}::${eventData.description}::${eventData.location}::${eventData.rating}::${createdAt}`;
        const msgBuffer = new TextEncoder().encode(hashInput);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const eventHash = hashArray
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const nonce = await this.web3Service.getNonce(
          this.web3Service.walletAddress()!,
        );

        const signature = await this.web3Service.signBookEvent(
          this.bookId()!,
          eventHash,
          nonce,
        );

        this.isSigning.set(false);

        this.onSubmit.emit({
          event: { ...eventData, created_at: createdAt },
          files: this.uploadedFiles,
          signature,
          walletAddress: this.web3Service.walletAddress()!,
        });
      } catch (err: any) {
        this.isSigning.set(false);

        const isCancelled =
          err.code === 4001 ||
          err.code === 'ACTION_REJECTED' ||
          err?.info?.error?.code === 4001 ||
          err.message?.includes('rejected') ||
          err.message?.includes('cancelled');

        if (isCancelled) {
          this.toastService.error('Signing cancelled');
        } else {
          this.toastService.error(err.message ?? 'Signing failed');
        }
        return;
      }
    } else {
      this.toastService.error('Connect your wallet to sign the event');
      return;
    }

    this.close();
  }

  onImageUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }
}
