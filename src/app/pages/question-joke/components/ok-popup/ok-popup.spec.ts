import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkPopup } from './ok-popup';

describe('OkPopup', () => {
  let component: OkPopup;
  let fixture: ComponentFixture<OkPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OkPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OkPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
