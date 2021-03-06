import { Injectable } from '@angular/core';
import { ApiConfig } from '../../api.config.ts';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class WebsocketService {
  private socket: SocketIOClient.Emitter;

  /**
   * Initializes Socket.io client with Jwt.
   */
  public getSocket(): SocketIOClient.Emitter {
    if (!this.socket) {
      this.socket = io(ApiConfig.url, {
        transports: ['websocket'],
        query: 'token=' + window.localStorage.getItem('id_token')
      });
    }

    return this.socket;
  }

  public onConnected(): Observable<any> {
    let websocket = this.getSocket();
    return Observable.create(obs => {
      websocket.on('connection', res => obs.next(res));
    });
  }
}
