import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AngularFirestoreModule } from '@angular/fire/firestore'
import {
  AngularFireStorageModule,
  AngularFireStorageReference,
  AngularFireUploadTask,

} from "@angular/fire/storage";
import { AppComponent } from './app.component';
import { HomeComponent } from './Unauthenticated/home/home.component';
import { UCreatePostComponent } from './Unauthenticated/u-create-post/u-create-post.component';
import { UPostDetailComponent } from './Unauthenticated/upost-detail/upost-detail.component';

import { CrudService } from './Unauthenticated/shared/crud.service';
import { AuthComponentComponent } from './Authentication/auth-component/auth-component.component';
import { AuthService } from './Authentication/shared/auth.service';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { ACrudService } from './Authentication/shared/acrud.service';
import { UserPostComponent } from './user/user-post/user-post.component';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { ProfileComponent } from './user/profile/profile.component';
import { ViewProfileComponent } from './user/view-profile/view-profile.component';

import { ViewOnlyPublicPostComponent } from './user/view-only-public-post/view-only-public-post.component';
import { AuthGuard } from './Authentication/shared/auth-guard.service';
import { LoadingSpinnerComponent } from './spinner/loading-spinner/loading-spinner.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ResetpasswordComponent } from './Authentication/resetpassword/resetpassword.component';
import { ToastrModule } from 'ngx-toastr';
import { VerifyMailComponent } from './Authentication/verify-mail/verify-mail.component';
import { NoSanitizePipe } from './Authentication/shared/no-sanitize.pipe';




@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UCreatePostComponent,
    UPostDetailComponent,
    AuthComponentComponent,
    UserPostComponent,
    UserEditComponent,
    ProfileComponent,
    ViewProfileComponent,
    ViewOnlyPublicPostComponent,
    LoadingSpinnerComponent,
    ResetpasswordComponent,
    VerifyMailComponent,
    NoSanitizePipe,

    
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    Ng2SearchPipeModule,
    ToastrModule.forRoot()

  ],
  providers: [CrudService,AuthService,ACrudService,AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
