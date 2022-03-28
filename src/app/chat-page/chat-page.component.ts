import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatrixService } from '../services/matrix.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit {

  public msgs$ = this._client.msgs$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _client: MatrixService,
  ) { }

  async ngOnInit(){
    const roomId = this._route.snapshot.paramMap.get('roomId');
    if (!roomId) {
      throw new Error('No room id');
    }
    await this._client.join(roomId)
      .catch(err => {
        console.error(err);
        this._router.navigate(['/r']);
      });
  }

  addMsg(msg: string) {
    const roomId = this._route.snapshot.paramMap.get('roomId')||'';
    this._client.sendMsg(roomId, msg);
  }

}
