import { Inject, Injectable } from '@angular/core';
import { createClient, MatrixClient, MatrixEvent, EventType, Visibility } from 'matrix-js-sdk';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatrixService {

  private _client!: MatrixClient|null;
  private _msgs$: BehaviorSubject<any> = new BehaviorSubject([]);
  public msgs$: Observable<any> = this._msgs$.asObservable();
  private _rooms$: BehaviorSubject<any> = new BehaviorSubject([]);
  public rooms$: Observable<any> = this._rooms$.asObservable();

  constructor(
    @Inject('client') private _tmpClient: MatrixClient,
    @Inject('config') private readonly _config: any,
    ) {
  }

  async checkAuth() {
    const token = this._getLocalToken();
    if (!token) {
      return false;
    }
    const opts = JSON.parse(token);
    const client = createClient({
      baseUrl: opts.baseUrl,
      accessToken: opts.accessToken,
      userId: opts.userId,
      deviceId: opts.deviceId
    });
    this._client = client;
    this._client.setGuest(true);
    return this._client.isLoggedIn();
  }

  async logout() {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
    await this._client
      .logout()
      .catch((err) => {
        console.log(err);
      });
    this._client = null;
    localStorage.removeItem('matrix_token');
  }

  async signInAsGuest(baseUrl: string) {
    const {access_token, user_id, device_id} = await this._tmpClient.registerGuest({});
    const opts = {
      baseUrl,
      accessToken: access_token,
      userId: user_id,
      deviceId: device_id,
    };
    const client: MatrixClient = createClient(opts);
    client.setGuest(true);
    console.log('client:', client);
    this._client = client;
    this._setLocalToken(JSON.stringify(opts));
  }

  async signInWithPassword(baseUrl: string, username: string, password: string) {    
    // const {access_token, user_id, device_id} = await this._tmpClient.register(
    //   username, 
    //   password, 
    //   null, 
    //   { type: 'm.login.password' },
    // );
    try {
      await fetch('https://matrix.org/_matrix/client/r0/register ', {
        method: 'POST',
        body: JSON.stringify({
          type: "m.login.password",
          password,
          user: username,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      })
      .then(res => res.json())
      .then(res => {
        console.log('fetch>>', res);
        // const sessionId = res['session'];
        // const expectedFlow = ["m.login.dummy"];
        // let hasFlow = false;
        
        // for (const flow of res['flows']) {
        //     const stages = flow['stages'];
        //     if (stages.length !== expectedFlow.length) continue;
        //     let stagesMatch = true;
        //     for (let i = 0; i < stages.length; i++) {
        //         if (stages[i] !== expectedFlow[i]) {
        //             stagesMatch = false;
        //             break;
        //         }
        //     }
        //     if (stagesMatch) {
        //         hasFlow = true;
        //         break;
        //     }
        // }
        
        // // if (!hasFlow) throw new Error("Failed to find appropriate login flow in User-Interactive Authentication");
        // const body = {
        //   password,
        //   username,
        //   auth: {
        //     type: expectedFlow[0], // HACK: We assume we only have one entry here
        //     session: sessionId,
        //   },
        //   session: sessionId,
        // };
        // const o = {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Accept': 'application/json',
        //   }
        // }
        // console.log('before fetch 2');
        
        // return fetch('https://matrix.org/_matrix/client/r0/register', {
        //   ...o,
        //   body: JSON.stringify(body)
        // })
        // .then(res => res.json());
      })
      .then(res => {
        console.log('fetch 2>>', res);
      });
      
      // await this._tmpClient.register(
      //   username, password, null, { type: 'm.login.dummy' }
      // )
    } catch (error) {
      console.log(error);
      
    }
    // const {access_token, user_id, device_id} = 
    // .catch(async (err) => {
    //   await this._tmpClient.loginWithPassword(username, password)
    //     .then((res) => {
    //       console.log('loginWithPassword>>',res);
    //       return res;
    //     })
    // });
    // const opts = {
    //   baseUrl,
    //   accessToken: access_token,
    //   userId: user_id,
    //   deviceId: device_id
    // }
    // const client: MatrixClient = createClient(opts);
    // this._client = client;
    // this._setLocalToken(JSON.stringify(opts));
  }
    
  async initClient() {
    if (!this._client) {
      throw new Error('client is not available');
    }
    await this._client.startClient();
    // this._client.agreeToTerms(
    //   SERVICE_TYPES.IM,
    //   this._config.baseUrl,
    //   this._client.getAccessToken(),
    //   []
    // );
    this._client.on("event" as any, (event: MatrixEvent) =>{
      // console.log(event.getType());
      if (event.getType() === EventType.RoomMessage) {
        console.log(event);
        const msgs = this._msgs$.getValue();
        // add to the list of messages
        msgs.push({
          content: event.getContent(), 
          sender: event.getSender(),
          roomId: event.getRoomId(),
          localTimestamp: event.localTimestamp,
        });
        // sort by timestamp
        msgs.sort((a, b) => a.localTimestamp - b.localTimestamp);
        // set the new list
        this._msgs$.next(msgs);
      }
    });
    await new Promise((resolve, reject) => {
      if (!this._client) {
        reject(new Error('client is not available'));
      }
      this._client?.once('sync' as any, (state, prevState, res) => {
          console.log('>>>>>>', state); // state will be 'PREPARED' when the client is ready to use
          if (state === 'PREPARED') {
            resolve(true);
          }
      });
    });
  }

  async createRoom(name: string) {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
    const res = await this._client.createRoom({
      name,
      visibility: Visibility.Private,
      invite: [this._client.getUserId()],
    });
    console.log('createRoom', res);
    // add to the list of rooms
    const rooms = this._rooms$.getValue();
    rooms.push(res);
    this._rooms$.next(rooms);
  }

  async getRooms() {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
    const rooms = this._client.getRooms();
    if (rooms.length <= 0){
      rooms.push({roomId: '!jhpZBTbckszblMYjMK:matrix.org'} as any);
    }
    this._rooms$.next(rooms);
    return rooms;
  }

  async join(roomId = '!jhpZBTbckszblMYjMK:matrix.org') {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
    return await this._client.joinRoom(roomId);
  }

  async leave(roomId: string) {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
    return await this._client.leave(roomId);
  }
  
  async sendMsg(roomId = '!jhpZBTbckszblMYjMK:matrix.org', body: string) {
    if (!this._client) {
      throw new Error('client is not initialized');
    }
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

  private _getLocalToken() {
    return localStorage.getItem('matrix_token');
  }

  private _setLocalToken(token: string) {
    localStorage.setItem('matrix_token', token);
  }
}
