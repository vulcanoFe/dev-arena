import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalYes } from './final-yes';

describe('FinalYes', () => {
  let component: FinalYes;
  let fixture: ComponentFixture<FinalYes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalYes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinalYes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
