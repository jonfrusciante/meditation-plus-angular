import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { ApiConfig } from '../../api.config.ts';
import { Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { WebsocketService } from '../shared';

@Injectable()
export class AppointmentService {

  public constructor(
    public authHttp: AuthHttp,
    public wsService: WebsocketService
  ) {
  }

  public getAll() {
    return this.authHttp.get(
      ApiConfig.url + '/api/appointment'
    );
  }

  public get(id: string) {
    return this.authHttp.get(
      ApiConfig.url + '/api/appointment/' + id
    );
  }

  public save(appointment) {
    const method = appointment._id ? 'put' : 'post';

    return this.authHttp[method](
      ApiConfig.url + '/api/appointment' + (appointment._id ? '/' + appointment._id : ''),
      appointment, {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public registration(appointment) {
    return this.authHttp.post(
      `${ApiConfig.url}/api/appointment/${appointment._id}/register`,
      '', {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Initializes Socket.io client with Jwt and listens to 'appointment'.
   */
  public getSocket(): Observable<any> {
    let websocket = this.wsService.getSocket();

    return Observable.create(obs => {
      websocket.on('appointment', res => obs.next(res));
    });
  }

  public delete(appointment) {
    return this.authHttp.delete(
      ApiConfig.url + '/api/appointment/' + appointment._id, {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public deleteRegistration(appointment) {
    return this.authHttp.delete(
      ApiConfig.url + '/api/appointment/remove/' + appointment._id, {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}
