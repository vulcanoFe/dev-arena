import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionJoke } from './question-joke';

describe('QuestionJoke', () => {
  let component: QuestionJoke;
  let fixture: ComponentFixture<QuestionJoke>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionJoke]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionJoke);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
