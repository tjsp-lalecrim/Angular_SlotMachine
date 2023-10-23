import { Component } from '@angular/core';
import { CreditService } from './credit.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Slot Machine';
  credits = 0;

  private subscription!: Subscription;

  constructor(private creditService: CreditService) {
    this.subscription = this.creditService.getCredits().subscribe({
      next: (value) => (this.credits = value),
    });
  }
}
