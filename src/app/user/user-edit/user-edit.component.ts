import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ACrudService } from 'src/app/Authentication/shared/acrud.service';
import { Subscription, Observable } from 'rxjs';
import { UPost } from 'src/app/Unauthenticated/shared/UPost.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from 'src/app/Unauthenticated/shared/crud.service';
import { callbackify } from 'util';
import { count } from 'rxjs/operators';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {

  exampleForm: FormGroup;


  id: number
  posttype
  isFetching: boolean;
  isAll: boolean;
  isPublic: boolean;
  isPrivate: boolean;

  allPost: UPost[];
  error: string;
  list


  values = ['Happy', 'Sad', 'Success', 'Failure', 'Hurt', 'Other'];
  selected = 'Happy'
  imageSrc: string | ArrayBuffer;
  downloadURL: string;
  selectedFile: any;
  uploadPercent: Observable<number>;
  isloggedin: boolean = false;
  privacy: string
  d4: any[];
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
    private route: ActivatedRoute,
    private router: Router,
    public acrud: ACrudService,
    private fb: FormBuilder,
    private firebaseService: CrudService,
  ) { }

  ngOnInit(): void {
    this.acrud.getDemo1();
    this.acrud.getDemo2()
    this.acrud.getAllData()

    this.route.params
      .subscribe(
        (params: Params) => {

          this.id = +params['id'];
          this.posttype = params['type']
        });




    if (this.posttype === 'allpost') {
      this.getAllPosts()
    }

    if (this.posttype === 'public') {
      this.getPublicPosts();
    }

    if (this.posttype === 'private') {
      this.getPriavtePosts()
    }

    this.EditForm()

  }

  getAllPosts() {
    this.isFetching = true
    this.isAll = true;
    this.isPublic = false;
    this.isPrivate = false;
    this.acrud.getAllData()
      .subscribe(data => {
        let x1 = data[0]
        let x2 = data[1]
        let x3 = []
        x3 = this.acrud.seprate(x1)
        let x4 = this.acrud.seprate(x2)
        this.d4 = x3.concat(x4)
        this.setFormValue(this.d4[this.id])
        this.isFetching = false
      },

        err => {
          this.isFetching = false
          this.error = err
        })

  }
  setFormValue(d4) {
    this.imageSrc = d4.imgurl
    this.downloadURL = d4.imgurl
    this.exampleForm.patchValue({

      title: d4.title,
      desc: d4.desc,
      category: d4.category,
      name: d4.name,
      privacy: d4.privacy
    })
  }
  getPublicPosts() {
    this.isFetching = true
    this.isAll = false;
    this.isPublic = true;
    this.isPrivate = false;
    this.acrud.getPublicPost()
      .subscribe(data => {
        let x3 = this.acrud.seprate(data)
        this.d4 = x3

        this.setFormValue(this.d4[this.id])
        this.isFetching = false
      },

        err => {
          this.isFetching = false
          this.error = err
        })
  }
  getPriavtePosts() {
    this.isFetching = true
    this.isAll = false;
    this.isPublic = false;
    this.isPrivate = true;
    this.acrud.getPrivatePost()
      .subscribe(data => {
        let x3 = this.acrud.seprate(data)
        this.d4 = x3

        this.setFormValue(this.d4[this.id])
        this.isFetching = false
      },

        err => {
          this.isFetching = false
          this.error = err
        })
  }


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

  EditForm() {
    this.exampleForm = this.fb.group({
      imgurl: [''],
      title: ['', Validators.required],
      desc: ['', [Validators.required, Validators.minLength(50)]],
      category: [this.selected, Validators.required],
      subcategory: ['  ', Validators.required],
      name: ['', Validators.required],
      privacy: ["true"],
    });
  }



  onSubmit(value: UPost) {
    if (this.posttype === 'allpost' && value.privacy) {
      this.getAllPosts()
    }

    if (this.posttype === 'public') {
      this.getPublicPosts();
    }

    if (this.posttype === 'private') {
      this.getPriavtePosts()
    }

    this.acrud.passParams(this.posttype, this.id)
    this.acrud.update(this.id, this.d4[this.id], value, this.downloadURL)
  }

}
