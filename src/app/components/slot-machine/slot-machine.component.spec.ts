import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { SlotMachineComponent } from './slot-machine.component';
import { By } from '@angular/platform-browser';

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
  }));


  it('should return prize when checkIndexes is called', () => {
    let prizes = Object.values(component.prizes);

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
});
