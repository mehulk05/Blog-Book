import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../shared/crud.service';
import { UPost } from '../shared/UPost.model';
import { AuthService } from 'src/app/Authentication/shared/auth.service';
import { ACrudService } from 'src/app/Authentication/shared/acrud.service';

@Component({
  selector: 'app-u-create-post',
  templateUrl: './u-create-post.component.html',
  styleUrls: ['./u-create-post.component.css']
})
export class UCreatePostComponent implements OnInit {

  isAuthenticated = false;
  private userSub: Subscription;

  isloading: boolean
  isprofileset
  isimgloading: boolean
  exampleForm: FormGroup;
  values = ['Happy', 'Sad', 'Success', 'Failure', 'Hurt', 'Study', 'Educational', 'Portfolio', 'Other'];
  selected = 'Happy'
  imageSrc: string | ArrayBuffer;
  downloadURL: string;
  selectedFile: any;
  uploadPercent: Observable<number>;
  isloggedin: boolean = false;
  privacy: string
  username: any;
  uid: any;
  error: any;
  onChange(value) {

    this.selected = value;

  }

  validation_messages = {
    'title': [
      { type: 'required', message: 'Title is required.' }
    ],
    'desc': [
      { type: 'required', message: 'Description is required.' }
    ],
    'category': [
      { type: 'required', message: 'Category is required.' },
    ],
    'name': [
      { type: 'required', message: 'Name is required.' },
    ]
  };
  constructor(
    private router: Router,
    private firebaseService: CrudService,
    private fb: FormBuilder,
    private authService: AuthService,
    private acrud: ACrudService

  ) { }

  detectFiles(event) {
    this.isimgloading = true
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

      this.isimgloading = false
    },
      err => {
        this.error = err
        console.log(err.message)
      })


  }

  ngOnInit(): void {


    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
  
      let uid=user.uid
      this.acrud.getProfileFromUid(uid).subscribe(data=>{
        let profile=this.acrud.seprate(data)
        this.isprofileset=profile[0].isProfileSet
      
        if(!this.isprofileset){
          this.router.navigate(['myprofile'])
          this.acrud.showWarningForProfileSet()
        }
      })

    })


/* 
    this.acrud.getProfileFromUid() */

    this.createForm();
    if (this.isAuthenticated) {
      this.getUidandUname()
    }

  }
  getUidandUname() {
    this.isloading = true
    this.acrud.getProfile().subscribe(d => {
      let x = this.acrud.seprate(d)
      this.isloading = false
      this.username = x[0].uname
      this.uid = x[0].id


      this.acrud.sendUidandUname(this.username, this.uid)
      this.firebaseService.sendUidandUname(this.username, this.uid)
    },
      err => {
        this.error = err
      })
  }

  createForm() {
    this.exampleForm = this.fb.group({
      imgurl: ['', Validators.required],
      title: ['', Validators.required],
      desc: ['', [Validators.required, Validators.minLength(50)]],
      category: [this.selected, Validators.required],
      subcategory: ['  ', Validators.required],
      name: ['', Validators.required],
      privacy: ["true"],

    });
  }
  onSubmit(value: UPost) {

    if (!!this.isAuthenticated) {

      if (this.exampleForm.value.privacy == "true") {
        this.firebaseService.createUser(value)
      }
      this.acrud.createPost(value)
      this.exampleForm.reset();
      this.isloading = true

    }
    else {
      this.firebaseService.createUser(value)
        .then(
          res => {
            this.exampleForm.reset();
            this.router.navigate(['']);
          })
        .catch(err => {
          this.error = err
          console.log("err" + err)
        })
    }

  }
  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}


