import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RoomsPageComponent } from './rooms-page/rooms-page.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'r',
    children: [
      {
        path: '',
        component: RoomsPageComponent
      },
      {
        path: ':roomId',
        component: ChatPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
