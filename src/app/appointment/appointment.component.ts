import { Component, ApplicationRef } from '@angular/core';
import { AppointmentService } from './appointment.service';
import { Response } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs/Rx';
import { AppState } from '../app.service';
import { UserService } from '../user/user.service';
import * as moment from 'moment-timezone';

const timezones = require('timezones.json');

// HACK: for Google APIs
const $script = require('scriptjs');
declare var gapi: any;

@Component({
  selector: 'appointment',
  template: require('./appointment.component.html'),
  styles: [
    require('./appointment.component.css')
  ]
})
export class AppointmentComponent {

  appointments: Object[] = [];
  appointmentSocket;
  rightBeforeAppointment: boolean = false;
  loadedInitially: boolean = false;
  userHasAppointment: boolean = false;
  currentTab: string = 'table';

  // EDT or EST
  zoneName: string = moment.tz('America/Toronto').zoneName();

  profile;

  constructor(
    public appointmentService: AppointmentService,
    public appRef: ApplicationRef,
    public appState: AppState,
    public route: ActivatedRoute,
    public userService: UserService
  ) {
    this.appState.set('title', 'Schedule');
    this.route.params
      .filter(res => res.hasOwnProperty('tab'))
      .subscribe(res => this.currentTab = (<any>res).tab);
  }

  /**
   * Returns the user id stored in localStorage
   */
  getUserId(): string {
    return window.localStorage.getItem('id');
  }

  /**
   * Returns wether user is admin or not
   */
  get isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  /**
   * Method for querying appointments
   */
  loadAppointments(): void {
    this.userHasAppointment = false;
    this.appointmentService
      .getAll()
      .map(res => res.json())
      .map(res => {
        this.rightBeforeAppointment = false;
        this.loadedInitially = true;

        // find current user and check if appointment is now
        for (const appointment of res.appointments) {
          if (!appointment.user) continue;
          if (appointment.user._id !== this.getUserId()) continue;

          this.userHasAppointment = true;

          const currentDay = moment.tz('America/Toronto').weekday();
          const currentHour = parseInt(moment.tz('America/Toronto').format('HHmm'), 10);
          const currentMoment = moment(this.printHour(currentHour), 'HH:mm');
          const appointMoment = moment(this.printHour(appointment.hour), 'HH:mm');

          if (Math.abs(moment.duration(appointMoment.diff(currentMoment)).asMinutes()) <= 5
            && appointment.weekDay === currentDay
          ) {
            this.activateHangoutsButton();
            break;
          }
        }

        return res;
      })
      .subscribe(res => this.appointments = res);
  }

  /**
   * Display Hangouts Button
   */
  activateHangoutsButton() {
    // initialize Google Hangouts Button
    $script('https://apis.google.com/js/platform.js', () => {
      this.rightBeforeAppointment = true;

      // kick in Change Detection
      this.appRef.tick();

      gapi.hangout.render('hangout-button', {
        'render': 'createhangout',
        'invites': [{ 'id': 'yuttadhammo@gmail.com', 'invite_type': 'EMAIL' }],
        'initial_apps': [{
          'app_id': '211383333638',
          'start_data': 'dQw4w9WgXcQ',
          'app_type': 'ROOM_APP'
        }],
        'widget_size': 175
      });
    });
  }

  /**
   * Registration handling
   */
  toggleRegistration(evt, appointment) {
    evt.preventDefault();

    // disallow registration for taken time slots
    if (appointment.user && appointment.user._id !== this.getUserId())
      return;

    this.appointmentService.registration(appointment)
      .subscribe(() => {
        this.loadAppointments();
      }, (err) => {
        console.error(err);
      });
  }

  /**
   * Admin can remove registered appointments
   */
  removeRegistration(evt, appointment){
    evt.preventDefault();

    if (!this.isAdmin)
      return;

    if (!confirm('Are you sure?')) {
      return;
    }

    this.appointmentService.deleteRegistration(appointment)
      .subscribe(() => {
        this.loadAppointments();
      }, (err) => {
        console.error(err);
      });

  }

  /**
   * Converts hour from number to string.
   * @param  {number} hour EST/EDT hour from DB
   * @return {string}      Local hour in format 'HH:mm'
   */
  printHour(hour: number): string {
    // automatically fills empty space with '0' (i.e. 40 => '0040')
    let hourFormat = Array(5 - hour.toString().length).join('0') + hour.toString();

    return moment(hourFormat, 'HHmm').format('HH:mm');
  }

  /**
   *  Tries to identify the user's timezone
   */
  getLocalTimezone() {
    if (this.profile && this.profile.timezone) {
      // lookup correct timezone name from profile model
      for (let k of timezones) {
        // check if timezone is compatible with moment-timezone
        if (k.value === this.profile.timezone && moment().tz(k.utc[1])) {
          return k.utc[1];
        }
      }
    }

    // guess timezone otherwise
    return moment.tz.guess();
  }

  /**
   * Converts UTC hour to local hour.
   * @param  {number} hour EST/EDT hour
   * @return {string}      Local hour
   */
  getLocalHour(hour: number): string {
    let timezone = this.getLocalTimezone();

    // create moment in EST/EDT timezone
    let eastern = moment.tz(this.printHour(hour), 'HH:mm', 'America/Toronto');

    // convert it it to users timezone and return
    return eastern.tz(timezone).format('HH:mm');
  }

  weekDay(weekDay: string): string {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekDay];
  }

  getButtonColor(tab: string) {
    return this.currentTab === tab ? 'primary' : '';
  }

  isCurrentTab(tab: string): boolean {
    return this.currentTab === tab;
  }

  ngOnInit() {
    this.loadAppointments();

    // initialize websocket for instant data
    this.appointmentSocket = this.appointmentService.getSocket()
      .subscribe(() => {
        this.loadAppointments();
      });

    this.userService.getProfile(this.getUserId())
      .map(res => res.json())
      .subscribe(
        res => this.profile,
        err => console.log(err)
      );
  }

  ngOnDestroy() {
    this.appointmentSocket.unsubscribe();
  }
}
