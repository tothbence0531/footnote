import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { IftaLabel } from 'primeng/iftalabel';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { BooksService } from '../../services/books.service';
import { Book } from '../../models/book.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { switchMap, take } from 'rxjs';

@Component({
  selector: 'app-add-book',
  imports: [
    InputTextModule,
    TextareaModule,
    FormsModule,
    RatingModule,
    FileUploadModule,
    IftaLabel,
    IconFieldModule,
    InputIcon,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.scss',
})
export class AddBookComponent {
  private fb = inject(FormBuilder);

  uploadedFiles: any[] = [];
  coverImage: any = null;
  isSubmitting = false;

  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  addBookForm = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
  });

  onUpload(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  onCoverUpload(event: any) {
    if (event.files.length !== 1) {
      this.toastService.error('Please select one file');
      return;
    }
    this.coverImage = event.files[0];
  }

  onSubmit() {
    if (this.addBookForm.invalid) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.toastService.error('You must be logged in to add a book');
      return;
    }

    if (!this.coverImage) {
      this.toastService.error('You must upload a cover image');
      return;
    }

    this.isSubmitting = true;

    this.authService.currentUser$
      .pipe(
        take(1),
        switchMap((user) => {
          if (!user) {
            this.toastService.error('You must be logged in to add a book');
            throw new Error('You must be logged in to add a book');
          }

          return this.booksService.uploadCoverImage(this.coverImage!).pipe(
            switchMap((uploadResult) => {
              const book: Book = {
                ...(this.addBookForm.value as Book),
                cover_image_url: uploadResult.coverUrl,
                original_owner: user.userId,
              };
              return this.booksService.addOwnedBook(book);
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.success('Book added successfully');
          this.isSubmitting = false;
          this.addBookForm.reset();
          this.coverImage = null;
        },
        error: (error) => {
          this.toastService.error(
            error?.error?.error?.message ?? 'Something went wrong',
          );
          this.isSubmitting = false;
        },
      });
  }
}
