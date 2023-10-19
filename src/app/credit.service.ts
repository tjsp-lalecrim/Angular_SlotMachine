import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreditService {
  private credits$ = new BehaviorSubject<number>(200);
  private payout$ = new BehaviorSubject<number>(0);

  getCredits(): Observable<number> {
    return this.credits$.asObservable();
  }

  setCredits(credits: number) {
    this.credits$.next(credits);
  }

  getPayout(): Observable<number> {
    return this.payout$.asObservable();
  }

  setPayout(payout: number) {
    this.payout$.next(payout);
  }
}
