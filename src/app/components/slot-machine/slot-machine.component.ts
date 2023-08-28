import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.component.html',
  styleUrls: ['./slot-machine.component.scss'],
})
export class SlotMachineComponent implements AfterViewInit {
  @ViewChild('slots') slots?: ElementRef;
  iconWidth = 79;
  iconHeight = 79;
  numIcons = 9;
  timePerIcon = 100;
  indexes = [0, 0, 0];
  iconMap = [
    'banana',
    'seven',
    'cherry',
    'plum',
    'orange',
    'bell',
    'bar',
    'lemon',
    'melon',
  ];
  rolling = false;

  ngAfterViewInit(): void {
    this.rollAll();
  }

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
    const normTargetBackgroundPositionY =
      targetBackgroundPositionY % (this.numIcons * this.iconHeight);

    return new Promise((resolve) => {
      // calc time to resolve
      const extraFruits = 8;
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

  // Roll all reels
  rollAll(): void {
    if (this.rolling) return;
    this.rolling = true;

    // getting all reels
    const reelsList = this.slots?.nativeElement.querySelectorAll('.reel');

    // Getting all roll promisses and map to the indexes
    Promise.all(
      [...reelsList].map((reel: HTMLDivElement, i: number) =>
        this.roll(reel, i),
      ),
    ).then((deltas) => {
      deltas.forEach(
        (delta: number, i: number) =>
          (this.indexes[i] = (this.indexes[i] + delta) % this.numIcons),
      );

      const twoInRow =
        this.indexes[0] == this.indexes[1] &&
        this.indexes[0] == this.iconMap.findIndex((icon) => icon === 'cherry');
      const threeInRow =
        this.indexes[0] == this.indexes[1] &&
        this.indexes[1] == this.indexes[2];
      if (twoInRow || threeInRow) {
        console.log('Jackpot!');
      }


      this.rolling = false;
    });
  }
}
