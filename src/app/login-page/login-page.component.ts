import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MatrixClient } from 'matrix-js-sdk';
import { MatrixService } from '../services/matrix.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  form!: FormGroup;
  constructor(
    private readonly _client: MatrixService,
    private readonly _router: Router,
    private readonly _alertCtrl: AlertController,
    @Inject('config') private readonly _config: any,
  ) {  }

  async ngOnInit() {
    const isAuth = await this._client.checkAuth();
    if (isAuth) {
      await this._client.initClient();
      this._router.navigate(['/r']);
    }
    this.form = new FormGroup({
      baseUrl: new FormControl(this._config.baseUrl),
    });
  }

  async signInAsGuset() {
    await this._client.signInAsGuest(this.form.value.baseUrl);
    await this._client.initClient();
    this._router.navigate(['/r']);
  }

  async signInWithPwd() {
    const ionAlert = await this._alertCtrl.create({
      header: 'Sign in',
      inputs: [
        {
          name: 'username',
          type: 'text',
          placeholder: 'Username'
        },
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Ok',
          role: 'ok',
          cssClass: 'primary',
        }
      ]
    });
    await ionAlert.present();
    const { role, data } = await ionAlert.onDidDismiss();
    if (role !== 'ok') {
      return;
    }
    console.log(data)
    await this._client.signInWithPassword(
      this.form.value.baseUrl, 
      data.values.username, 
      data.values.password
    );
    await this._client.initClient();
    this._router.navigate(['/r']);
  }

}
