import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookEventCardComponent } from './book-event-card.component';

describe('BookEventCardComponent', () => {
  let component: BookEventCardComponent;
  let fixture: ComponentFixture<BookEventCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookEventCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookEventCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
