import { Injectable, NgZone } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Subject, BehaviorSubject } from 'rxjs';
import { User, User1 } from './user.model';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth'
import { ToastrService } from 'ngx-toastr';
export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = false;
  api = environment.firebaseConfig.apiKey
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;
  userdata = null
  userData: any;
  LoginData = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient,
    public afAuth: AngularFireAuth,
    private router: Router,
    private toastr: ToastrService,
    public ngZone: NgZone) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }


  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=' + this.api,
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );

        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=' + this.api,
        {
          email: email,
          password: password,
          returnSecureToken: true
        }
      )
      .pipe(
        catchError(this.handleError),
        tap(resData => {
          this.handleAuthentication(
            resData.email,
            resData.localId,
            resData.idToken,
            +resData.expiresIn
          );
        })
      );
  }


  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.auth
        .signInWithPopup(provider)
        .then(res => {
          this.handleAuthentication(
            res.user.email,
            res.user.uid,
            res.user.refreshToken,
            +360000
          );

          resolve(res);
        }, err => {

          reject(err);
        })
    })
  }
  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }

  }

  logout() {
    return this.afAuth.auth.signOut().then(() => {
      this.user.next(null);

      localStorage.removeItem('userData');
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }
      this.tokenExpirationTimer = null;

      this.router.navigate(['/auth']);
    })

  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    userId: string,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.userdata = user
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
    this.isAuthenticated = true;

  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email exists already';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'This email does not exist.';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'This password is not correct.';
        break;
    }
    return throwError(errorMessage);
  }



  isLoggedIn(): boolean {
    this.user.subscribe(userdata => {
      this.userdata = userdata
    })
    if (this.userdata !== null) {

      return true;
    }
  }

  sendEmailVerification() {
    this.afAuth.auth.currentUser.sendEmailVerification()

    this.router.navigate(['auth']);
  }

  async sendPasswordResetEmail(passwordResetEmail: string) {
    return await this.afAuth.auth.sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        if (this.isAuthenticated) {
          this.logout()
        }
        this.router.navigate(['auth']);
        this.showSuccess();
      })

  }


  SignUp(email, password) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((result) => {

        this.logout()
        this.SendVerificationMail(); // Sending email verification notification, when new user registers
      })
  }

  SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification()
      .then(() => {
        this.showError()
        this.router.navigate(['verify-mail']);



      })
      .catch(e => {
        this.toastr.warning(e.message, 'Alert', {
          timeOut: 5000
        })
      })

  }


  SignIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.LoginData.next(result)


        if (result.user.emailVerified !== true) {
          this.SendVerificationMail();

        }
        else {
          this.SetUserData(result.user);
        }

      })


  }

  isLoggedIn1() {
    const user = JSON.parse(localStorage.getItem('user'));
    this.user.next(user)
    return (user !== null && user.emailVerified !== false) ? true : false;
  }

  SetUserData(user) {

    const userData: User1 = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    }



    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;

        localStorage.setItem('user', JSON.stringify(this.userData));
        const user1 = JSON.parse(localStorage.getItem('user'));

        this.user.next(user1)
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })

  }
  showSuccess() {
    this.toastr.success('Password Link Sent', 'Please check your registered email', {
      timeOut: 20000
    });
  }
  showError() {
    this.toastr.info('Email Verfication Link Sent.Verify Using the link', 'Please check your registered email', {
      timeOut: 5000
    });
  }

  showerrorForResetMail() {
    this.toastr.error('Error while sending Reset Password Link', 'Error ', {
      timeOut: 5000
    });
  }
}

