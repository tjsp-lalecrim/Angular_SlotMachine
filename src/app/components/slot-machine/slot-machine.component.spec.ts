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
    component.checkResult([1, 1, 1]);
    flush();

    expect(component.addCredits).toHaveBeenCalled();
    expect(component.checkIndexes).toHaveBeenCalledWith([1, 1, 1]);

    // Multiplier = 2
    component.multiplier = 2;
    component.checkResult([0, 4, 8]);
    flush();

    expect(component.checkIndexes).toHaveBeenCalledWith([8, 3, 7]);
    expect(component.checkIndexes).toHaveBeenCalledWith([1, 5, 0]);

    expect(component.addCredits).toHaveBeenCalledTimes(1);
  }));
});
