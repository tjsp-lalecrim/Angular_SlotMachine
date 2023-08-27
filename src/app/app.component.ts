import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Angular Games';
  @ViewChild('gridList', { static: true }) gridList?: ElementRef;
  gridColumns = 3;

  games: any[] = [];

  constructor() {
    this.setGames();
    this.setGridColumns();
  }

  setGames() {
    this.games = [
      {
        title: 'Game #1',
        category: 'Classic',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      },
      {
        title: 'Game #2',
        category: 'Puzzle',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Vestibulum eget iaculis est. In vitae mauris lectus.`,
      },
      {
        title: 'Game #3',
        category: 'Card',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Vestibulum eget iaculis est. In vitae mauris lectus. 
        Suspendisse vitae fermentum eros, quis sollicitudin erat. 
        Fusce leo erat, tincidunt et scelerisque ac, facilisis at risus.`,
      },
      {
        title: 'Game #4',
        category: 'Card',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Vestibulum eget iaculis est. In vitae mauris lectus. 
        Suspendisse vitae fermentum eros, quis sollicitudin erat.`,
      },
      {
        title: 'Game #5',
        category: 'Classic',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      },
      {
        title: 'Game #6',
        category: 'Action',
        description: `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
        Vestibulum eget iaculis est. In vitae mauris lectus.`,
      },
    ];
  }

  setGridColumns() {
    const gridWidth =
      this.gridList?.nativeElement.clientWidth ?? window.innerWidth;
    if (gridWidth > 1200) this.gridColumns = 3;
    else if (gridWidth > 800) this.gridColumns = 2;
    else this.gridColumns = 1;
  }
}
