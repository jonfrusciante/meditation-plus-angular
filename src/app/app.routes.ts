import { RouterConfig } from '@angular/router';
import { Home } from './home';
import { Login } from './login';
import { ProfileComponent, ProfileFormComponent } from './profile';
import { AppointmentComponent } from './appointment';
import { HelpComponent } from './help';
import { AuthGuard } from './auth-guard';
//import { NoContent } from './no-content';

export const routes: RouterConfig = [
  { path: '', component: Home, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileFormComponent, canActivate: [AuthGuard] },
  { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'help', component: HelpComponent, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'schedule', component: AppointmentComponent, canActivate: [AuthGuard] }

  //{ path: '**',    component: NoContent },
];