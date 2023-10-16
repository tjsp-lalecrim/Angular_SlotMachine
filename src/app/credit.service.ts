import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CreditService {
  private credits$ = new BehaviorSubject<number>(200);
  private payout$ = new Subject<number>();

  constructor() {}

  getCredits(): Observable<number> {
    const value = this.credits$.getValue();
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
