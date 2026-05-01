import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { ConsultantDashboardComponent } from './components/consultant-dashboard.component';
import { ApplicantFormComponent } from './components/applicant-form.component';
import { FormBuilderComponent } from './components/form-builder.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'consultant', component: ConsultantDashboardComponent },
  { path: 'applicant', component: ApplicantFormComponent },
  { path: 'builder', component: FormBuilderComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
