import { Directive, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

import { HomeComponent } from './home.component';

@Directive({
  selector: '[routerLink]',
  host: { '(click)': 'onClick()' },
})
export class RouterLinkDirectiveStub {
  @Input('routerLink') linkParams: any;
  navigatedTo: any = null;

  onClick() {
    this.navigatedTo = this.linkParams;
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatGridListModule, MatCardModule],
      declarations: [HomeComponent, RouterLinkDirectiveStub],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should recalculate grid columns when window size is changed', () => {
    window.innerWidth = 1201;
    component.setGridColumns();
    fixture.detectChanges();
    expect(component.gridColumns).toEqual(3);

    window.innerWidth = 1200;
    component.setGridColumns();
    fixture.detectChanges();
    expect(component.gridColumns).toEqual(2);

    window.innerWidth = 801;
    component.setGridColumns();
    fixture.detectChanges();
    expect(component.gridColumns).toEqual(2);

    window.innerWidth = 800;
    component.setGridColumns();
    fixture.detectChanges();

    expect(component.gridColumns).toEqual(1);
  });
});
