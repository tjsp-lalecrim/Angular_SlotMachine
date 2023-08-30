import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss'],
})
export class SlotMachineComponent {
  @ViewChild('slots') slots?: ElementRef;
  iconWidth = 79;
  iconHeight = 79;
  numIcons = 9;
  timePerIcon = 100;
  indexes = [0, 0, 0];
  prizes = {
    'banana': 60, // banana
    'seven': 700, // seven
    'cherry': 50, // cherry,
    'plum': 70, // plum,
    'orange': 80, // orange,
    'bell': 150, // bell,
    'bar': 250, // bar,
    'lemon': 90, // lemon,
    'melon': 100, // melon
  };
  cherryIndex = 2;
  rolling = false;
  credits = 100;
  balance = 0;
  currCost = 5;

  // Roll a reel
  roll(reel: HTMLDivElement, offset = 0): Promise<number> {
    // delta represents the amount of fruits will be animated
    const delta =
      (offset + 2) * this.numIcons + Math.round(Math.random() * this.numIcons);

    // getting current background position
    const style = getComputedStyle(reel);
    const backgroundPositionY = parseFloat(style.backgroundPositionY);
    const targetBackgroundPositionY =
      backgroundPositionY + delta * this.iconHeight;
    // Normalize target background position
    // const normTargetBackgroundPositionY =
    //   targetBackgroundPositionY % (this.numIcons * this.iconHeight);

    return new Promise((resolve) => {
      // extra value for delta
      const extraFruits = 8;
      // calculate time to solve
      const timeToResolveMs = extraFruits + delta * this.timePerIcon;

      // setting styles
      reel.style.transition = `background-position-y ${timeToResolveMs}ms cubic-bezier(.45, .05, .58, 1.09)`;
      reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;

      // delay delta resolve
      setTimeout(() => {
        // reel.style.transition = `none`;
        // reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;

        resolve(delta % this.numIcons);
      }, timeToResolveMs);
    });
  }

  chargeCredits(cost: number): void {
    if (this.rolling) return;

    this.rolling = true;
    this.balance = -cost;

    const interval = setInterval(() => {
      if (this.balance === 0) {
        clearInterval(interval);
        return this.rollAll();
      }

      this.balance++;
      this.credits--;
    }, 100);
  }

  rollAll(): void {
    const reelsList = this.slots?.nativeElement.querySelectorAll('.reel');

    // Getting all promisses and map to the indexes
    Promise.all(
      [...reelsList].map((reel: HTMLDivElement, i: number) => this.roll(reel, i)),
    )
      .then((deltas) => {
        deltas.forEach(
          (delta: number, i: number) =>
            (this.indexes[i] = (this.indexes[i] + delta) % this.numIcons),
        );

        this.checkResult(this.indexes);
      });
  }

  checkResult(result: number[]) {
    const prizeIndex = result[0];
    const twoCherries = result[0] == result[1] && result[0] == this.cherryIndex;
    const threeInRow = result.every(i => i === prizeIndex);

    if (threeInRow)
      this.balance = Object.values(this.prizes)[prizeIndex] ?? 0;
    else if (twoCherries)
      this.balance = 20;

    // give credits
    let interval = setInterval(() => {
      if (this.balance === 0) {
        clearInterval(interval);
        return this.rolling = false;
      }

      this.balance--;
      this.credits++;
      return;
    }, 50);
  }
}
