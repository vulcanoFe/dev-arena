import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCrypto } from './search-crypto';

describe('SearchCrypto', () => {
  let component: SearchCrypto;
  let fixture: ComponentFixture<SearchCrypto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCrypto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCrypto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
