import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddbookActivityCardComponent } from './addbook-activity-card.component';

describe('AddbookActivityCardComponent', () => {
  let component: AddbookActivityCardComponent;
  let fixture: ComponentFixture<AddbookActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddbookActivityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddbookActivityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
