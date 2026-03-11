import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddeventActivityCardComponent } from './addevent-activity-card.component';

describe('AddeventActivityCardComponent', () => {
  let component: AddeventActivityCardComponent;
  let fixture: ComponentFixture<AddeventActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddeventActivityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddeventActivityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
