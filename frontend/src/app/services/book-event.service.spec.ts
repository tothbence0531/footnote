import { TestBed } from '@angular/core/testing';

import { BookEventService } from './book-event.service';

describe('BookEventService', () => {
  let service: BookEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
