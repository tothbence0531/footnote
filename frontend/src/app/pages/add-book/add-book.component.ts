import { Component, inject, signal } from '@angular/core';
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
import { from, switchMap, take } from 'rxjs';
import { BookEvent } from '../../models/book-event.model';
import { Web3Service } from '../../services/web3.service';
import { environment } from '../../../environments/environment.dev';

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
  isSigning = signal(false);

  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private toastService: ToastService,
    private eventService: BookEventService,
    private web3Service: Web3Service,
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

  async onSubmit() {
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

    const { title, author, location, description, rating } =
      this.addBookForm.value;

    let bookSignature: string | undefined;
    let eventSignature: string | undefined;
    let walletAddress: string | undefined;
    let eventCreatedAt: string | undefined;

    if (this.web3Service.isConnected()) {
      try {
        this.isSigning.set(true);

        walletAddress = this.web3Service.walletAddress()!;

        this.isSigning.set(false);
      } catch (err: any) {
        this.isSigning.set(false);
        const isCancelled =
          err.code === 4001 ||
          err.code === 'ACTION_REJECTED' ||
          err?.info?.error?.code === 4001 ||
          err.message?.includes('rejected');

        if (isCancelled) {
          this.toastService.error('Aláírás elutasítva');
        } else {
          this.toastService.error(err.message ?? 'Aláírás sikertelen');
        }
        return;
      }
    } else {
      this.toastService.error(
        'Connect your wallet to sign the book and first event',
      );
      return;
    }

    this.isSubmitting = true;

    this.authService.currentUser$
      .pipe(
        take(1),
        switchMap((user) => {
          if (!user) throw new Error('Not logged in');

          return this.booksService.uploadCoverImage(this.coverImage!).pipe(
            switchMap((uploadResult) => {
              const book: Book = {
                title: title!,
                author: author!,
                cover_image_url: uploadResult.coverUrl,
                original_owner: user.userId,
                wallet_address: walletAddress,
              } as Book;

              return this.booksService.addOwnedBook(book).pipe(
                switchMap((createdBook) => {
                  const createdAt = new Date().toISOString();

                  if (this.web3Service.isConnected()) {
                    return from(
                      this.signAndGetEventData(
                        createdBook,
                        user.userId,
                        location!,
                        description!,
                        rating!,
                        createdAt,
                      ),
                    ).pipe(
                      switchMap(({ signature, eventHash }) => {
                        return this.eventService.addEvent(
                          {
                            book_id: createdBook.id!,
                            location: location!,
                            description: description!,
                            rating: rating!,
                            created_at: createdAt,
                          } as BookEvent,
                          this.uploadedFiles,
                          signature,
                          walletAddress,
                        );
                      }),
                    );
                  }

                  return this.eventService.addEvent(
                    {
                      book_id: createdBook.id!,
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
          const isCancelled =
            error?.code === 4001 ||
            error?.code === 'ACTION_REJECTED' ||
            error?.message?.includes('rejected');

          if (isCancelled) {
            this.toastService.error('Signing cancelled');
          } else {
            this.toastService.error(
              error?.error?.error?.message ?? 'Something went wrong',
            );
          }
          this.isSubmitting = false;
        },
      });
  }
  private async signAndGetEventData(
    createdBook: Book,
    userId: string,
    location: string,
    description: string,
    rating: number,
    createdAt: string,
  ): Promise<{ signature: string; eventHash: string }> {
    const hashInput = `${createdBook.id}::${userId}::${description}::${location}::${rating}::${createdAt}`;
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
      createdBook.id!,
      eventHash,
      nonce,
    );

    return { signature, eventHash };
  }
}
