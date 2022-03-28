import { Inject, Injectable } from '@angular/core';
import { createClient, MatrixClient, SERVICE_TYPES } from 'matrix-js-sdk';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  private _client!: MatrixClient;
  private _msgs$: BehaviorSubject<any> = new BehaviorSubject([]);
  public msgs$: Observable<any> = this._msgs$.asObservable();

  constructor(
    @Inject('client') private _tmpClient: MatrixClient,
    @Inject('config') private readonly _config: any,
    ) {
  }

  async signInAsGuest(baseUrl: string) {
    const {access_token, user_id, device_id} = await this._tmpClient.registerGuest({});
    const client: MatrixClient = createClient({
      baseUrl,
      accessToken: access_token,
      userId: user_id,
      deviceId: device_id,
    });
    client.setGuest(true);
    console.log('client:', client);
    this._client = client;
  }
    
  async initClient() {
    await this._client.startClient();
    // this._client.agreeToTerms(
    //   SERVICE_TYPES.IM,
    //   this._config.baseUrl,
    //   this._client.getAccessToken(),
    //   []
    // );
    this._client.once('sync' as any, (state, prevState, res) => {
        console.log('>>>>>>', state); // state will be 'PREPARED' when the client is ready to use
    });
    this._client.on("event" as any, (event) =>{
      // console.log(event.getType());
      if (event.getType() === 'm.room.message') {
        console.log(event);
        const msgs = this._msgs$.getValue();
        msgs.push({
          body: event.getContent().body, 
          sender: event.getSender(),
          roomId: event.getRoomId(),
        });
        this._msgs$.next(msgs);
      }
    });
  }

  async getRooms() {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
    const rooms = this._client.getRooms();
    console.log('rooms:', rooms);
    rooms.forEach(room => {
        console.log(room.roomId);
    });
    return [...rooms, {roomId: '!jhpZBTbckszblMYjMK:matrix.org'}];
  }

  async join(roomId = '!jhpZBTbckszblMYjMK:matrix.org') {
    return await this._client.joinRoom(roomId);
  }
  
  async sendMsg(roomId = '!jhpZBTbckszblMYjMK:matrix.org', body: string) {
    var content = {
      body,
      "msgtype": "m.text"
    };
    const res = await this._client.sendEvent(roomId, "m.room.message", content, "")
      .catch((err) => {
          console.log(err);
      });
    console.log(res);
  }
}
