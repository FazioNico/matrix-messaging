import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatrixService } from '../services/matrix.service';

@Component({
  selector: 'app-rooms-page',
  templateUrl: './rooms-page.component.html',
  styleUrls: ['./rooms-page.component.scss']
})
export class RoomsPageComponent implements OnInit {

  rooms: any[] = [];
  constructor(
    private readonly _client: MatrixService,
    private readonly _router: Router
  ) { }

  async ngOnInit() {
    this.rooms = await this._client.getRooms()
  }

}
