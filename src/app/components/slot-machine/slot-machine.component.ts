import { Component, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { CreditService } from 'src/app/credit.service';

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss'],
})
export class SlotMachineComponent {
  @ViewChild('slots') slots?: ElementRef;

  private creditsSubscription!: Subscription;
  private payoutSubscription!: Subscription;

  iconWidth = 79;
  iconHeight = 79;
  numIcons = 9;
  timePerIcon = 100;
  indexes = [0, 0, 0];
  rolling = false;
  credits = 0;
  payout = 0;
  cost = 5;
  multiplier = 1;

  constructor(private creditService: CreditService) {
    this.creditsSubscription = this.creditService.getCredits().subscribe({
      next: (value) => (this.credits = value),
    });

    this.payoutSubscription = this.creditService.getPayout().subscribe({
      next: (value) => (this.payout = value),
    });
  }

  roll(reel: HTMLElement, offset = 0): Promise<number> {
    // delta represents the amount of fruits will be animated
    const delta =
      (offset + 2) * this.numIcons + Math.round(Math.random() * this.numIcons);

    // getting current background position
    const style = getComputedStyle(reel);
    const backgroundPositionY = parseFloat(style.backgroundPositionY);
    const targetBackgroundPositionY =
      backgroundPositionY + delta * this.iconHeight;

    return new Promise((resolve) => {
      const extraFruits = this.numIcons; // add extra value for delta
      const timeToResolveMs = extraFruits + delta * this.timePerIcon;

      // setting styles
      reel.style.transition = `background-position-y ${timeToResolveMs}ms cubic-bezier(.45, .05, .58, 1.09)`;
      reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;

      // delay delta resolve
      setTimeout(() => {
        resolve(delta % this.numIcons);
      }, timeToResolveMs);
    });
  }

  rollAll(): void {
    const reelsList = this.slots?.nativeElement.querySelectorAll('.reel');

    // Getting all promisses and map to the indexes
    Promise.all(
      [...reelsList].map((reel: HTMLDivElement, i: number) =>
        this.roll(reel, i),
      ),
    ).then((deltas) => {
      deltas.forEach(
        (delta: number, i: number) =>
          (this.indexes[i] = (this.indexes[i] + delta) % this.numIcons),
      );

      this.checkResult(this.indexes);
    });
  }

  chargeCredits(cost: number): void {
    if (this.rolling || this.credits < cost) return;

    this.rolling = true;
    this.creditService.setPayout(-cost);

    const interval = setInterval(() => {
      if (this.payout === 0) {
        clearInterval(interval);
        return this.rollAll();
      }

      this.creditService.setPayout(this.payout + 1);
      this.creditService.setCredits(this.credits - 1);

      return;
    }, 100);
  }

  checkIndexes(indexes: number[]): number {
    // map indexes to reels values
    const values = this.mapIndexes(indexes);
    const isCherry = values[0] === 'cherry';

    // three in row
    if (values.every((string) => string === values[0])) {
      const prizeKey = Object.keys(prizes).findIndex((k) => k === values[0]);
      return Object.values(prizes)[prizeKey];
    }

    // two cherries
    if (values[0] === values[1] && isCherry) return this.cost * 3;

    return 0;
  }

  private fixIndex(i: number): number {
    if (i < 0) return this.numIcons - 1;
    if (i > this.numIcons - 1) return 0;
    return i;
  }

  private mapIndexes(indexes: number[]) {
    return reels.map((array, i) => array[indexes[i]]);
  }

  addCredits(): void {
    // add 1 from payout to credits every 50ms
    const interval = setInterval(() => {
      if (this.payout === 0) {
        clearInterval(interval);
        return (this.rolling = false);
      }

      this.creditService.setPayout(this.payout - 1);
      this.creditService.setCredits(this.credits + 1);
      return;
    }, 50);
  }

  checkResult(indexes: number[]): void {
    let prize = 0;

    // check center
    const centerLine = [...indexes];
    prize += this.checkIndexes(centerLine);

    // check top and bottom
    if (this.multiplier >= 2) {
      const topLine = indexes.map((i) => this.fixIndex(i - 1));
      const bottomLine = indexes.map((i) => this.fixIndex(i + 1));

      prize += this.checkIndexes(topLine);
      prize += this.checkIndexes(bottomLine);
    }

    // check diagonal
    if (this.multiplier >= 3) {
      const topDiagonalLine = [indexes[0] - 1, indexes[1], indexes[2] + 1].map(
        (i) => this.fixIndex(i),
      );
      const bottomDiagonalLine = [
        indexes[0] + 1,
        indexes[1],
        indexes[2] - 1,
      ].map((i) => this.fixIndex(i));

      prize += this.checkIndexes(topDiagonalLine);
      prize += this.checkIndexes(bottomDiagonalLine);
    }

    this.creditService.setPayout(prize);
    this.addCredits();
  }
}

export const reels = [
  [
    'banana',
    'seven',
    'cherry',
    'plum',
    'orange',
    'bell',
    'bar',
    'lemon',
    'melon',
  ],
  [
    'plum',
    'banana',
    'seven',
    'cherry',
    'orange',
    'bell',
    'bar',
    'lemon',
    'melon',
  ],
  [
    'banana',
    'seven',
    'cherry',
    'plum',
    'orange',
    'bell',
    'bar',
    'lemon',
    'melon',
  ],
];

export const prizes = {
  seven: 700,
  banana: 60,
  cherry: 50,
  plum: 70,
  orange: 80,
  bell: 150,
  bar: 250,
  lemon: 90,
  melon: 100,
};
