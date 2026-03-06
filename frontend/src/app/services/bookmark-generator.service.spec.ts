import { TestBed } from '@angular/core/testing';

import { BookmarkGeneratorService } from './bookmark-generator.service';

describe('BookmarkGeneratorService', () => {
  let service: BookmarkGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookmarkGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
