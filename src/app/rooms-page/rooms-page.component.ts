import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { MatrixService } from '../services/matrix.service';

@Component({
  selector: 'app-rooms-page',
  templateUrl: './rooms-page.component.html',
  styleUrls: ['./rooms-page.component.scss']
})
export class RoomsPageComponent {

  rooms: any[] = [];
  constructor(
    private readonly _client: MatrixService,
    private readonly _router: Router,
    private readonly _alertCtrl: AlertController
  ) { }

  // use ionic life cycle hooks
  async ionViewWillEnter() {
    this.rooms = await this._client.getRooms()
    .catch(err => {
      console.error(err);
      this._router.navigate(['/']);
      return [];
    })
  }

  async actions(type: string, payload?:any) {
    switch (true) {
      case type === 'addRoom':
        this._addRoom();
        break;
      case type === 'logout':
        await this._client.logout();
        this._router.navigate(['/']);
        break;
      default:
        break;
    }
  }

  private async _addRoom() {
    // ask uuser for room name
    const roomName = await this._alertCtrl.create({
      header: 'Enter room name',
      inputs: [
        {
          name: 'roomName',
          type: 'text',
          placeholder: 'Room name'
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
        }
      ]
    });
    await roomName.present();
    const { role, data } = await roomName.onDidDismiss();
    if (role !== 'ok') {
      return;
    }
    // create room
    await this._client.createRoom(data.roomName);
  }
}
