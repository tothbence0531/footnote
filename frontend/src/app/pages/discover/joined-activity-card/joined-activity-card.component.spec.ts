import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinedActivityCardComponent } from './joined-activity-card.component';

describe('JoinedActivityCardComponent', () => {
  let component: JoinedActivityCardComponent;
  let fixture: ComponentFixture<JoinedActivityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinedActivityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinedActivityCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
