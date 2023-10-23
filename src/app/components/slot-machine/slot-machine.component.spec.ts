import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SlotMachineComponent, prizes, reels } from './slot-machine.component';

describe('SlotMachineComponent', () => {
  let component: SlotMachineComponent;
  let fixture: ComponentFixture<SlotMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SlotMachineComponent],
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
    tick(2600); // (cost + last interval cycle) * 50ms

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
    spyOn(fixture.componentInstance, 'roll');

    component.rollAll();
    flush();

    expect(component.roll).toHaveBeenCalledTimes(3);
    expect(component.checkResult).toHaveBeenCalled();
  }));

  it('should call checkIndexes and addCredits when checkResult is called', fakeAsync(() => {
    spyOn(fixture.componentInstance, 'addCredits');
    spyOn(fixture.componentInstance, 'checkIndexes');

    // Multiplier = 1
    component.checkResult([1, 1, 1]); // seven seven seven
    flush();

    expect(component.checkIndexes).toHaveBeenCalledWith([1, 1, 1]); // center
    expect(component.checkIndexes).toHaveBeenCalledTimes(1); // +1 time

    // Multiplier = 2
    component.multiplier = 2;
    component.checkResult([0, 4, 8]);
    flush();

    expect(component.checkIndexes).toHaveBeenCalledWith([0, 4, 8]); // center
    expect(component.checkIndexes).toHaveBeenCalledWith([8, 3, 7]); // top
    expect(component.checkIndexes).toHaveBeenCalledWith([1, 5, 0]); // bottom
    expect(component.checkIndexes).toHaveBeenCalledTimes(4); // +3 times

    // Multiplier = 3
    component.multiplier = 3;
    component.checkResult([0, 4, 8]); // banana plum melon
    flush();

    expect(component.checkIndexes).toHaveBeenCalledWith([0, 4, 8]); // center
    expect(component.checkIndexes).toHaveBeenCalledWith([8, 3, 7]); // top
    expect(component.checkIndexes).toHaveBeenCalledWith([1, 5, 0]); // bottom
    expect(component.checkIndexes).toHaveBeenCalledWith([8, 4, 0]); // top diagonal
    expect(component.checkIndexes).toHaveBeenCalledWith([0, 4, 8]); // bottom diagonal
    expect(component.checkIndexes).toHaveBeenCalledTimes(9); // +5 times

    expect(component.addCredits).toHaveBeenCalledTimes(3);
  }));

  it('should return prize when checkIndexes is called', () => {
    // mock reels result
    const bananas = reels.map((reel) => reel.findIndex((r) => r === 'banana'));
    const sevens = reels.map((reel) => reel.findIndex((r) => r === 'seven'));
    const cherries = reels.map((reel) => reel.findIndex((r) => r === 'cherry'));
    const plums = reels.map((reel) => reel.findIndex((r) => r === 'plum'));
    const oranges = reels.map((reel) => reel.findIndex((r) => r === 'orange'));
    const bells = reels.map((reel) => reel.findIndex((r) => r === 'bell'));
    const bars = reels.map((reel) => reel.findIndex((r) => r === 'bar'));
    const lemons = reels.map((reel) => reel.findIndex((r) => r === 'lemon'));
    const melons = reels.map((reel) => reel.findIndex((r) => r === 'melon'));

    expect(component.checkIndexes(bananas)).toEqual(prizes['banana']); // banana
    expect(component.checkIndexes(sevens)).toEqual(prizes['seven']); // seven
    expect(component.checkIndexes(cherries)).toEqual(prizes['cherry']); // cherry
    expect(component.checkIndexes(plums)).toEqual(prizes['plum']); // plum
    expect(component.checkIndexes(oranges)).toEqual(prizes['orange']); // orange
    expect(component.checkIndexes(bells)).toEqual(prizes['bell']); // bell
    expect(component.checkIndexes(bars)).toEqual(prizes['bar']); // bar
    expect(component.checkIndexes(lemons)).toEqual(prizes['lemon']); // lemon
    expect(component.checkIndexes(melons)).toEqual(prizes['melon']); // melon
    expect(component.checkIndexes([2, 3, 0])).toEqual(component.cost * 3); // two cherries
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
});
