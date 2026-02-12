import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeCaptcha } from './fake-captcha';

describe('FakeCaptcha', () => {
  let component: FakeCaptcha;
  let fixture: ComponentFixture<FakeCaptcha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakeCaptcha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FakeCaptcha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
