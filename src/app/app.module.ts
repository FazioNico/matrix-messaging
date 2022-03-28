import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
// @ts-ignore
import { createClient } from 'matrix-js-sdk';

import { LoginPageComponent } from './login-page/login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RoomsPageComponent } from './rooms-page/rooms-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    RoomsPageComponent,
    ChatPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
  ],
  providers: [
    {
      provide: 'config',
      useValue: environment.matrixConfig
    },
    {
      provide: 'client',
      useFactory: (config) => {
        return createClient(config.baseUrl);
      },
      deps: ['config']
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
