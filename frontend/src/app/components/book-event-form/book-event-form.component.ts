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
import { BookEvent, BookEventImage } from '../../models/book-event.model';
import { ToastService } from '../../services/toast.service';

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
  onSubmit = output<{ event: BookEvent; files: File[] }>();

  private fb = inject(FormBuilder);

  uploadedFiles: any[] = [];

  constructor(
    private dialogService: DialogService,
    private toastService: ToastService,
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

  save() {
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

    this.onSubmit.emit({
      event: this.addEventForm.value as BookEvent,
      files: this.uploadedFiles,
    });

    this.close();
  }

  onImageUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }
}
