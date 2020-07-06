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
  isPorfileset:boolean=false;
  constructor(private authService: AuthService,
    private acrud:ACrudService,
    private router :Router) { }

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

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password);
    }

    authObs.subscribe(
      resData => {
        this.getProfile()
        console.log(resData);
        this.isLoading = false;
      
        
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );

    form.reset();
  }
  getProfile() {
    this.acrud.getProfile().subscribe(d=>{
      let x=[]

      x=this.acrud.seprate(d)

   this.isPorfileset=x[0];

   if(this.isPorfileset){
      this.router.navigate(['/home']);
    }
   else{
    console.log(this.isPorfileset)
     this.router.navigate(['myprofile'])
   }

    })
  }

  tryGoogleLogin(){
    this.authService.doGoogleLogin()
    .then(res => {
      this.getProfile()
      
    })
  }
}



