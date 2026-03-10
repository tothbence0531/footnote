import { Component, inject } from '@angular/core';
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
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { BookEventService } from '../../services/book-event.service';
import { switchMap, take } from 'rxjs';
import { BookEvent } from '../../models/book-event.model';

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
    ReactiveFormsModule,
  ],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.scss',
})
export class AddBookComponent {
  private fb = inject(FormBuilder);

  uploadedFiles: File[] = [];
  coverImage: File | null = null;
  isSubmitting = false;

  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private toastService: ToastService,
    private eventService: BookEventService,
  ) {}

  addBookForm = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    location: ['', Validators.required],
    description: ['', Validators.required],
    rating: [0, [Validators.required]],
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
    if (!this.coverImage) {
      this.toastService.error('You must upload a cover image');
      return;
    }
    if (!this.uploadedFiles.length || this.uploadedFiles.length > 3) {
      this.toastService.error('Please upload 1-3 event images');
      return;
    }

    if (this.addBookForm.value.rating === 0) {
      this.toastService.error('Please provide a rating for the book');
      return;
    }

    this.isSubmitting = true;
    const { location, description, rating } = this.addBookForm.value;

    this.authService.currentUser$
      .pipe(
        take(1),
        switchMap((user) => {
          if (!user) throw new Error('Not logged in');

          return this.booksService.uploadCoverImage(this.coverImage!).pipe(
            switchMap((uploadResult) => {
              const book: Book = {
                title: this.addBookForm.value.title!,
                author: this.addBookForm.value.author!,
                cover_image_url: uploadResult.coverUrl,
                original_owner: user.userId,
              } as Book;

              return this.booksService.addOwnedBook(book).pipe(
                switchMap((createdBook) => {
                  return this.eventService.addEvent(
                    {
                      book_id: createdBook.id,
                      location: location!,
                      description: description!,
                      rating: rating!,
                    } as BookEvent,
                    this.uploadedFiles,
                  );
                }),
              );
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.success('Book and first event added successfully!');
          this.isSubmitting = false;
          this.addBookForm.reset();
          this.coverImage = null;
          this.uploadedFiles = [];
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
