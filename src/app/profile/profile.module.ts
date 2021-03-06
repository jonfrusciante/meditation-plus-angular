import { NgModule }      from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminComponent }  from './admin.component';
import { BadgeComponent } from './badge/badge.component';
import { FlagComponent } from './flag/flag.component';
import { OfflineMeditationComponent } from './offline-meditation/offline-meditation.component';
import { AvatarDirective } from './avatar.directive';
import { ProfileFormComponent } from './profile-form.component';
import { ProfileComponent } from './profile.component';
import { UserModule } from '../user';
import { SharedModule } from '../shared';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts';
import { MeditatedRecentlyDirective } from './meditated-recently.directive';

@NgModule({
  imports: [
    SharedModule,
    ChartsModule,
    RouterModule,
    FormsModule,
    UserModule,
    MomentModule
  ],
  declarations: [
    AvatarDirective,
    ProfileFormComponent,
    ProfileComponent,
    OfflineMeditationComponent,
    FlagComponent,
    BadgeComponent,
    MeditatedRecentlyDirective
  ],
  exports: [
    AvatarDirective,
    ProfileFormComponent,
    ProfileComponent,
    OfflineMeditationComponent,
    FlagComponent,
    BadgeComponent,
    MeditatedRecentlyDirective
  ]
})
export class ProfileModule { }
