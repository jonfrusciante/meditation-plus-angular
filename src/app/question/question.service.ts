import { Injectable } from '@angular/core';
import { AuthHttp } from 'angular2-jwt/angular2-jwt';
import { ApiConfig } from '../../api.config.ts';
import { Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { WebsocketService } from '../shared';

@Injectable()
export class QuestionService {

  public constructor(
    public authHttp: AuthHttp,
    public wsService: WebsocketService
  ) {
  }

  public getQuestions(
    filterAnswered: boolean = false,
    page: number = 0
  ): Observable<any> {
    let params = new URLSearchParams();
    params.set('filterAnswered', filterAnswered ? 'true' : 'false');
    params.set('page', '' + page);

    return this.authHttp.get(
      ApiConfig.url + '/api/question',
      { search: params }
    );
  }

  public post(question: string): Observable<any> {
    return this.authHttp.post(
      ApiConfig.url + '/api/question',
      JSON.stringify({ text: question }), {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public like(question): Observable<any> {
    return this.authHttp.post(
      ApiConfig.url + '/api/question/' + question._id + '/like',
      '', {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public delete(question): Observable<any> {
    return this.authHttp.delete(
      ApiConfig.url + '/api/question/' + question._id, {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public answer(question): Observable<any> {
    return this.authHttp.post(
      ApiConfig.url + '/api/question/' + question._id + '/answer',
      '', {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public answering(question): Observable<any> {
    return this.authHttp.post(
      ApiConfig.url + '/api/question/' + question._id + '/answering',
      '', {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  public unanswering(question): Observable<any> {
    return this.authHttp.post(
      ApiConfig.url + '/api/question/' + question._id + '/unanswering',
      '', {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }


  public findSuggestions(question: string): Observable<any> {
    return this.authHttp.post(
      ApiConfig.url + '/api/question/suggestions',
      JSON.stringify({ text: question }), {
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Initializes Socket.io client with Jwt and listens to 'question'.
   */
  public getSocket(): Observable<any> {
    let websocket = this.wsService.getSocket();

    return Observable.create(obs => {
      websocket.on('question', res => obs.next(res));
    });
  }
}
