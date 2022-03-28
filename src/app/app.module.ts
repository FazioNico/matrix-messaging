import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
// @ts-ignore
import { createClient, MatrixClient } from 'matrix-js-sdk';
import { LoginPageComponent } from './login-page/login-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RoomsPageComponent } from './rooms-page/rooms-page.component';
import { ChatPageComponent } from './chat-page/chat-page.component';

const matrixClientFactory = (matrixConfig: any) => {
  return async () => {
    console.log('hi', matrixConfig);
    const tmpClient: MatrixClient = createClient(matrixConfig.baseUrl);
    const {access_token, user_id, device_id} = await tmpClient.registerGuest({});
    const client: MatrixClient = createClient({
      baseUrl: matrixConfig.baseUrl,
      accessToken: access_token,
      userId: user_id,
      deviceId: device_id,
    })
    client.setGuest(true);
    window['matrixClient'] = client;
  }
}

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
