import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
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
    @Inject('config') private readonly _config: any,
  ) {  }

  ngOnInit() {
    this.form = new FormGroup({
      baseUrl: new FormControl(this._config.baseUrl),
    });
  }

  async signInAsGuset() {
    await this._client.signInAsGuest(this.form.value.baseUrl);
    await this._client.initClient();
    this._router.navigate(['/r']);
  }

}
