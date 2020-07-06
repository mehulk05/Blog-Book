import { Component, OnInit } from '@angular/core';
import { AuthService } from './Authentication/shared/auth.service';
import { Subscription, Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { ACrudService } from './Authentication/shared/acrud.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {
  isAuthenticated = false;
  x
  ProfieData: { uname: any; desc: string; email: string; name: any; created_date: Date; imgurl: Observable<string>;isProfileSet:boolean };
  isprofileSet:boolean=false
  username:string
  private userSub: Subscription;
  allpostcount: number=0;

  isloading:boolean=false
  constructor(private authService: AuthService,private acrud:ACrudService) {}
  title = 'write-your-heart-out';


  ngOnInit() {
    this.isloading=true
    this.authService.autoLogin();
    this.userSub = this.authService.user.subscribe(user => {
      console.log(user)
      this.isAuthenticated = !!user;
      console.log(!user);
      console.log(!!user);

      if(this.isAuthenticated){
        this.acrud.getProfile().subscribe(
          d=>{
            let x2:{}={}
        
            let x=this.acrud.seprate(d)
            this.ProfieData=x[0]
            if(this.ProfieData){
              this.isprofileSet=this.ProfieData.isProfileSet
              this.username=this.ProfieData.uname
              console.log(this.isprofileSet,this.username)
            }
            
            }
        )
      }
      this.isloading=false
      
    });

    this.getAllPosts() 
    /* this.x=this.authService.user2.subscribe(data=>{
      console.log(data)
      this.isAuthenticated = !!data;
      console.log(!data)
      console.log(!!data)
    }) */
  } 
  getAllPosts() {
    this.isloading=true
    this.acrud.getAllData()
    .subscribe(data => {
      let x1 = data[0]
      let x2 = data[1]
      let x3 = []
      x3 = this.acrud.seprate(x1)
      let x4 = this.acrud.seprate(x2)
   //   console.log(x3)


      let x5 = x3.concat(x4)
      this.allpostcount=x5.length
      this.isloading=false
      console.log(this.allpostcount)
  })
}
  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}