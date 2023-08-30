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
    'banana': 60,
    'seven': 700,
    'cherry': 50,
    'plum': 70,
    'orange': 80,
    'bell': 150,
    'bar': 250,
    'lemon': 90,
    'melon': 100,
  };
  cherryIndex = 2;
  rolling = false;
  credits = 100;
  balance = 0;
  currCost = 5;
  lines = 1;

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
      const extraFruits = this.numIcons; // add extra value for delta
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
    if (this.rolling || this.credits < cost) return;

    this.lines = cost / this.currCost;
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

  checkIndexes(indexes: number[]) {
    const firstValue = indexes[0];
    const line = [...indexes];

    // two cherries
    if (line[0] == line[1] &&
      line[0] == this.cherryIndex)
      return this.currCost * 3;

    // three in row
    if (indexes.every(i => i == firstValue))
      return Object.values(this.prizes)[firstValue] ?? 0;

    return 0;
  }

  fixIndexValue(i: number): number {
    if (i < 0) return this.numIcons - 1;
    if (i > this.numIcons - 1) return 0;
    return i;
  }

  checkResult(indexes: number[]): void {
    // check center
    const centerLine = [...indexes];
    this.balance += this.checkIndexes(centerLine);

    // check top and bottom
    if (this.lines >= 2) {
      const topLine = indexes.map(i => this.fixIndexValue(i - 1));
      const bottomLine = indexes.map(i => this.fixIndexValue(i + 1));

      console.log('Top Line', topLine);
      console.log('Bottom Line', bottomLine);

      this.balance += this.checkIndexes(topLine);
      this.balance += this.checkIndexes(bottomLine);
    }

    // check diagonal
    if (this.lines >= 3) {
      let topDiagonalLine =
        [indexes[0] - 1, indexes[1], indexes[2] + 1]
          .map(i => this.fixIndexValue(i))
      let bottomDiagonalLine =
        [indexes[0] + 1, indexes[1], indexes[2] - 1]
          .map(i => this.fixIndexValue(i));

      console.log('Top Diagonal Line', topDiagonalLine);
      console.log('Bottom Diagonal Line', bottomDiagonalLine);

      this.balance += this.checkIndexes(topDiagonalLine);
      this.balance += this.checkIndexes(bottomDiagonalLine);
    }

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
