import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, IonTextarea } from '@ionic/angular';
import { map, tap } from 'rxjs';
import { MatrixService } from '../services/matrix.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit {

  @ViewChild('content', { static: true }) public readonly content!: IonContent;
  public readonly msgs$ = this._client.msgs$.pipe(
    map(msgs => msgs.filter(
      (msg) => msg.roomId === this._route.snapshot.paramMap.get('roomId')
    )),
    tap(() => this._scrollDown())
  );
  public readonly roomId = this._route.snapshot.paramMap.get('roomId');

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _client: MatrixService,
    private readonly _alertCtrl: AlertController,
  ) { }

  async ngOnInit(){
    const roomId = this._route.snapshot.paramMap.get('roomId');
    if (!roomId) {
      throw new Error('No room id');
    }
    await this._client.join(roomId)
      .catch(async (err) => {
        console.error(err);
        let destinationUrl;
        // convert url from error message text to clickable link
        const message = err.message.replace(/https?:\/\/[^\s]+/g, (url) => {
          //  remove last character if it is a dot
          if (url.endsWith('.')) {
            url = url.slice(0, -1);
          }
          destinationUrl = url;
          return ' the new tab opened.' //  `<a href="${url}" target="_blank">${url}</a>`;
        });
        // show alert with error message
        const ionAlert = await this._alertCtrl.create({
          header: 'Terms of service',
          message,
          buttons: ['ok']
        });
        await ionAlert.present();
        await ionAlert.onDidDismiss();
        if (destinationUrl) {
          window.open(destinationUrl, '_blank');
          this._router.navigate(['/r']);
        } else {
          this._router.navigate(['/']);
        }
      });
  }

  async actions(type: string, payload?: any) {
    switch (true) {
      case type === 'sendMsg':
        await this.sendMsg(payload);
        break;
      case type === 'logout':
        await this._client.logout();
        this._router.navigate(['/']);
        break;
    }
  }

  private async sendMsg(textarea: IonTextarea) {
    console.log('sendMsg');
    
    const msg = textarea.value;
    if (!msg) {
      throw new Error('No message');
    }
    const roomId = this._route.snapshot.paramMap.get('roomId')||'';
    await this._client.sendMsg(roomId, msg);
    textarea.value = '';
  }

  private async _scrollDown() {
    console.log('scroll down');    
    setTimeout(async() => await this.content.scrollToBottom(200),10)
  }
}
