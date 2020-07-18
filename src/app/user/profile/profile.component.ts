import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudService } from 'src/app/Unauthenticated/shared/crud.service';
import { AuthService } from 'src/app/Authentication/shared/auth.service';
import { ACrudService } from 'src/app/Authentication/shared/acrud.service';
import { Profile } from 'src/app/Authentication/shared/user.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  imageSrc: string | ArrayBuffer;
  downloadURL: string;
  selectedFile: any;
  uploadPercent: Observable<number>;

  ProfileForm: FormGroup;

  validation_messages = {
    'uname': [
      { type: 'required', message: 'Title is required.' }
    ],

    'email': [
      { type: 'required', message: 'Category is required.' },
    ],
    'name': [
      { type: 'required', message: 'Name is required.' },
    ]
  };
  href: string;
  profileReturned: any;
  x: string[];
  username: any;
  erroUsername: string;
  oldusername: any;
  usernamParam: string
  email: string


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firebaseService: CrudService,
    private fb: FormBuilder,
    private authService: AuthService,
    private acrud: ACrudService
  ) { }

  detectFiles(event) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile.type.split('/')[0] !== 'image') {
      return alert('Pleas select an Image file');
    }
    this.firebaseService.getdata(this.selectedFile)
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.imageSrc = reader.result;
      reader.readAsDataURL(file);

    }
    this.firebaseService.uploadFile()
    this.uploadPercent = this.firebaseService.uploadPercent;
    this.firebaseService.downloadurlchange.subscribe((data: string) => {
      this.downloadURL = data

    },
      err => { console.log(err.message) })


  }
  ngOnInit(): void {
    this.authService.user.subscribe((x: any) => {

      if (x.email) {
        this.email = x.email

      }
    })
    this.href = this.router.url;
    this.x = this.href.split("/")

    this.usernamParam = this.x[2]
    if (this.x[2] && this.x[3] == "editProfile") {
      this.getProfileData()
    }

    this.CreateProfile()

    if (this.x[2] == null) {
      this.checkProfileExist()

    }

  }
  checkProfileExist() {
    this.acrud.getProfile().subscribe(d => {
      let x = this.acrud.seprate(d)
      this.profileReturned = x[0]
      if (this.profileReturned) {
        this.router.navigate(['myprofile', this.profileReturned.uname])
      }
    })
  }
  getProfileData() {
    this.acrud.getProfile().subscribe(d => {
      let x = this.acrud.seprate(d)
      this.profileReturned = x[0]

      if (this.usernamParam !== this.profileReturned.uname) {
        this.router.navigate(["home"])
      }
      this.SetProfileForm(x[0])

    })
  }
  SetProfileForm(profiled4eturned: any) {
    this.imageSrc = profiled4eturned.imgurl
    this.downloadURL = profiled4eturned.imgurl
    this.ProfileForm.patchValue({

      uname: profiled4eturned.uname,
      desc: profiled4eturned.desc,
      name: profiled4eturned.name,
      email: this.email,

    })
  }

  CreateProfile() {
    this.ProfileForm = this.fb.group({
      imgurl: ['', Validators.required],
      email: [this.email, Validators.required],
      desc: [''],
      name: ['', Validators.required],
      uname: ['', Validators.required,],


    });

  }
  validateUsername(): any {
    let x = ""
    if (this.profileReturned) {

      x = this.profileReturned.uname
    }
    else {
      x = ""
    }




    if (x !== this.username) {
      this.acrud.getPublicProfile(this.username).subscribe(d => {
        if (d !== null) {
          this.erroUsername = "Username Already taken"
        }
        else {
          this.erroUsername = null
        }
      })
    }
  }

  clearError() {
    this.erroUsername = ""
  }

  checkUsername(value) {
    this.username = value

    this.validateUsername()
  }

  onSubmit(value: Profile) {
    if (this.x[2] && this.x[3] == "editProfile") {
      this.acrud.UpdateProfile(value, this.profileReturned, this.downloadURL)
      this.ProfileForm.reset();

    }
    else {
      this.acrud.createProfile(value)
      this.ProfileForm.reset();
      //this.router.navigate(['']);
      let url = ""
      this.redirectTo(url)
    }

  }
  redirectTo(url: any) {

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
    setTimeout(() => {
      window.location.href = "";
    }, 1000)
  }
}