import { Component, OnInit } from '@angular/core';
import { AuthService, AuthResponseData } from '../shared/auth.service';
import { Observable } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ACrudService } from '../shared/acrud.service';

@Component({
  selector: 'app-auth-component',
  templateUrl: './auth-component.component.html',
  styleUrls: ['./auth-component.component.css']
})
export class AuthComponentComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  isPorfileset: boolean = false;
  constructor(private authService: AuthService,
    private acrud: ACrudService,
    private router: Router) { }

  ngOnInit(): void {

  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.isLoading = true;
    if (this.isLoginMode) {


      this.authService.SignIn(email, password)
        .then(d => {
          this.isLoading = false
          this.authService.LoginData.subscribe(x => {

            if (x.user.emailVerified) {
              this.getProfileByUid(x.user.uid)
            }
          })

        })
        .catch(e => {
          this.isLoading = false
          this.error = e.message
        })

    } else {

      this.authService.SignUp(email, password).then(d => {

        this.isLoading = false
        this.authService.logout()
      })
        .catch(e => {
          this.authService.logout()
          this.isLoading = false
          this.error = e
        })

    }


    form.reset();
  }


  tryGoogleLogin() {
    this.isLoading = true
    this.authService.doGoogleLogin()
      .then(res => {

        this.isLoading = false
        this.getProfileByUid(res.uid)

      })
  }


  getProfileByUid(uid) {

    this.acrud.getProfileFromUid(uid).subscribe(data => {




      let x = this.acrud.seprate(data)
      this.isPorfileset = x[0];

      this.isLoading = false

      if (this.isPorfileset) {
        this.router.navigate(['']);
      }
      else {

        this.router.navigate(['myprofile'])
      }

    })

  }

}



