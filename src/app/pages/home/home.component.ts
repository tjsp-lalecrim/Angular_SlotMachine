import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  @ViewChild('gridList', { static: true }) gridList?: ElementRef;
  gridColumns = 3;

  constructor() {
    this.setGridColumns();
  }

  setGridColumns() {
    const gridWidth =
      this.gridList?.nativeElement.clientWidth ?? window.innerWidth;
    if (gridWidth > 1200) this.gridColumns = 3;
    else if (gridWidth > 800) this.gridColumns = 2;
    else this.gridColumns = 1;
  }
}
