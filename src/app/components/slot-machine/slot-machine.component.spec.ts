import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreditService } from '../../credit.service';

import { SlotMachineComponent } from './slot-machine.component';

describe('SlotMachineComponent', () => {
  let component: SlotMachineComponent;
  let fixture: ComponentFixture<SlotMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlotMachineComponent],
      imports: [CommonModule, MatButtonModule, NoopAnimationsModule],
      errorOnUnknownElements: true,
      errorOnUnknownProperties: true,
    }).compileComponents();

    fixture = TestBed.createComponent(SlotMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call chargeCredits when buttons are clicked', () => {
    spyOn(fixture.componentInstance, 'chargeCredits');

    const buttons = fixture.debugElement.queryAll(By.css('.bets button'));

    // First button
    buttons[0].triggerEventHandler('click', null);
    expect(component.multiplier).toEqual(1);
    expect(component.chargeCredits).toHaveBeenCalledWith(component.cost * 1);

    // Second Button
    buttons[1].triggerEventHandler('click', null);
    expect(component.multiplier).toEqual(2);
    expect(component.chargeCredits).toHaveBeenCalledWith(component.cost * 2);

    // Third button
    buttons[2].triggerEventHandler('click', null);
    expect(component.multiplier).toEqual(3);
    expect(component.chargeCredits).toHaveBeenCalledWith(component.cost * 3);
  });

  it('should discount payout from credits and roll all reels when chargeCredits is called', fakeAsync(() => {
    spyOn(fixture.componentInstance, 'rollAll');

    component.credits = 150;
    component.chargeCredits(25);
    tick(2600); // (cost + last interval cycle) * 100ms

    expect(component.credits).toEqual(125);
    expect(component.rolling).toBeTrue();
    expect(component.rollAll).toHaveBeenCalled();
  }));

  it('should NOT discount payout from credits when chargeCredits is called and cost is greater than credits', fakeAsync(() => {
    spyOn(fixture.componentInstance, 'rollAll');

    component.credits = 100;
    component.chargeCredits(125);
    flush();

    expect(component.credits).toEqual(100);
    expect(component.rolling).toBeFalse();
    expect(component.rollAll).not.toHaveBeenCalled();
  }));

  it('should roll each reel and check result when rollAll is called', fakeAsync(() => {
    spyOn(fixture.componentInstance, 'checkResult');
    spyOn(fixture.componentInstance, 'roll').and.returnValues(
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    );
    component.indexes = [8, 7, 6];

    component.rollAll();
    flush();

    expect(component.roll).toHaveBeenCalledTimes(3);
    expect(component.indexes).toEqual([0, 0, 0]);
    expect(component.checkResult).toHaveBeenCalledWith([0, 0, 0]);
  }));

  [
    { multiplier: 1, lines: [[0, 4, 8]] },
    {
      multiplier: 2,
      lines: [
        [0, 4, 8],
        [8, 3, 7],
        [1, 5, 0],
      ],
    },
    {
      multiplier: 3,
      lines: [
        [0, 4, 8],
        [8, 3, 7],
        [1, 5, 0],
        [8, 4, 0],
        [1, 4, 7],
      ],
    },
  ].forEach(({ multiplier, lines }) => {
    it(
      'should evaluate exactly the active lines for multiplier ' + multiplier,
      () => {
        const check = spyOn(component, 'checkIndexes').and.callThrough();
        const add = spyOn(component, 'addCredits');
        component.multiplier = multiplier;
        component.checkResult([0, 4, 8]);
        expect(check.calls.allArgs()).toEqual(lines.map(line => [line]));
        expect(component.payout).toBe(0);
        expect(add).toHaveBeenCalledTimes(1);
      }
    );
  });

  it('should return prize when checkIndexes is called', () => {
    const prizes = Object.values(component.prizes);

    expect(component.checkIndexes([0, 0, 0])).toEqual(prizes[0]); // banana
    expect(component.checkIndexes([1, 1, 1])).toEqual(prizes[1]); // seven
    expect(component.checkIndexes([2, 2, 2])).toEqual(prizes[2]); // cherry
    expect(component.checkIndexes([3, 3, 3])).toEqual(prizes[3]); // plum
    expect(component.checkIndexes([4, 4, 4])).toEqual(prizes[4]); // orange
    expect(component.checkIndexes([5, 5, 5])).toEqual(prizes[5]); // bell
    expect(component.checkIndexes([6, 6, 6])).toEqual(prizes[6]); // bar
    expect(component.checkIndexes([7, 7, 7])).toEqual(prizes[7]); // lemon
    expect(component.checkIndexes([8, 8, 8])).toEqual(prizes[8]); // melon
    expect(component.checkIndexes([2, 2, 0])).toEqual(component.cost * 3); // two cherries
    expect(component.checkIndexes([7, 8, 2])).toEqual(0); // no prize
  });

  it('should add payout to credits when addCredits is called', fakeAsync(() => {
    spyOn(fixture.componentInstance, 'rollAll');

    component.credits = 100;
    component.payout = 50;
    component.rolling = true;

    component.addCredits();
    tick((component.payout + 1) * 50); // (payout + last interval cycle) * 50ms

    expect(component.credits).toEqual(150);
    expect(component.payout).toEqual(0);
    expect(component.rolling).toBeFalse();
  }));
  it('should animate the expected distance and resolve only after the duration', fakeAsync(() => {
    spyOn(Math, 'random').and.returnValue(2 / 9);
    const reel = fixture.nativeElement.querySelector('.reel') as HTMLDivElement;
    reel.style.backgroundPositionY = '79px';
    const resolved = jasmine.createSpy('resolved');
    component.roll(reel).then(resolved);
    expect(reel.style.backgroundPositionY).toBe('1659px');
    const duration = reel.style.transitionDuration;
    const durationMs =
      parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
    expect(durationMs).toBe(2009);
    tick(2008);
    expect(resolved).not.toHaveBeenCalled();
    tick(1);
    expect(resolved).toHaveBeenCalledWith(2);
  }));

  it('should stop charging when destroyed and unsubscribe from credits', fakeAsync(() => {
    const service = TestBed.inject(CreditService);
    const roll = spyOn(component, 'rollAll');
    component.chargeCredits(5);
    tick(100);
    expect(component.credits).toBe(199);
    fixture.destroy();
    tick(1000);
    expect(roll).not.toHaveBeenCalled();
    let credits = 0;
    const creditSubscription = service
      .getCredits()
      .subscribe(value => (credits = value));
    expect(credits).toBe(195);
    creditSubscription.unsubscribe();
    service.setCredits(500);
    expect(component.credits).toBe(199);
    let payout = -1;
    const subscription = service
      .getPayout()
      .subscribe(value => (payout = value));
    expect(payout).toBe(0);
    subscription.unsubscribe();
  }));

  it('should stop paying credits when destroyed', fakeAsync(() => {
    const service = TestBed.inject(CreditService);
    service.setPayout(50);
    component.addCredits();
    tick(50);
    expect(component.credits).toBe(201);
    fixture.destroy();
    tick(3000);
    expect(component.credits).toBe(201);
  }));

  it('should cancel pending rolls without checking results after destruction', fakeAsync(() => {
    const check = spyOn(component, 'checkResult');
    component.rollAll();
    fixture.destroy();
    flushMicrotasks();
    tick(10000);
    expect(component.indexes).toEqual([0, 0, 0]);
    expect(check).not.toHaveBeenCalled();
  }));

  it('should ignore a resolved roll callback queued before destruction', fakeAsync(() => {
    spyOn(component, 'roll').and.returnValue(Promise.resolve(1));
    const check = spyOn(component, 'checkResult');
    component.rollAll();
    fixture.destroy();
    flushMicrotasks();
    expect(check).not.toHaveBeenCalled();
  }));
  it('should settle a pending debit only once when destroyed repeatedly', () => {
    const service = TestBed.inject(CreditService);
    service.setPayout(-5);
    component.ngOnDestroy();
    component.ngOnDestroy();
    let credits = 0;
    const subscription = service
      .getCredits()
      .subscribe(value => (credits = value));
    expect(credits).toBe(195);
    subscription.unsubscribe();
  });

  it('should complete a full round and transfer the prize to credits', fakeAsync(() => {
    spyOn(Math, 'random').and.returnValue(0);
    component.chargeCredits(5);
    tick(8100);
    expect(component.indexes).toEqual([0, 0, 0]);
    expect(component.credits).toBe(255);
    expect(component.payout).toBe(0);
    expect(component.rolling).toBeFalse();
  }));
});
