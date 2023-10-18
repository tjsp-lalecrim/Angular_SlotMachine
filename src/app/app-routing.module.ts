import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GameComponent } from './pages/game/game.component';
import { SlotMachineComponent } from './components/slot-machine/slot-machine.component';

const routes: Routes = [
  {
    path: '',
    component: GameComponent,
    children: [
      {
        path: '',
        component: SlotMachineComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
