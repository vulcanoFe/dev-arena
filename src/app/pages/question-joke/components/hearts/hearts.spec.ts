import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hearts } from './hearts';

describe('Hearts', () => {
  let component: Hearts;
  let fixture: ComponentFixture<Hearts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hearts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hearts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
