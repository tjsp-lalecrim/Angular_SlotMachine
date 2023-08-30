import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SlotMachineComponent } from './components/slot-machine/slot-machine.component';
import { HomeComponent } from './pages/home/home.component';
import { GameComponent } from './pages/game/game.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'game',
    component: GameComponent,
    children: [
      {
        path: 'slot-machine',
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
