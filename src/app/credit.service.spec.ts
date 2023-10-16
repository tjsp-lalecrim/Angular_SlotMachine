import { TestBed } from '@angular/core/testing';

import { CreditService } from './credit.service';

describe('CreditService', () => {
  let service: CreditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should call setCredits with 300 and call getCredits, returning 300.', () => {
    service.setCredits(300);
    service.getCredits().subscribe(
      value => {
        expect(value).toEqual(300);
      }
    );
  })

  it('should call setPayout with 15 and call getPayout, returning 15.', () => {
    service.setPayout(15);
    service.getPayout().subscribe(
      value => {
        expect(value).toEqual(15);
      }
    );
  })

});
