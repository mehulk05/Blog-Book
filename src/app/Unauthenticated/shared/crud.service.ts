import { Injectable } from '@angular/core';
import { UPost } from './UPost.model';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  selectedFile: any | null;
  currentDate = new Date();
  downloadurlchange: Subject<any> = new Subject<any>();
  filepath: string
  uid: any;
  uname: any;
  constructor(
    private router: Router,
    private afStorage: AngularFireStorage,

    private afs: AngularFirestore,

  ) { }

  handleError(error: any) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  getdata(data) {
    this.selectedFile = data

  }


  get_public_post() {
    return this.afs.collection('normal-users').snapshotChanges().pipe(catchError(this.handleError))

  }

  sendUidandUname(uname, id) {
    this.uid = id
    this.uname = uname
  }
  createUser(value: UPost) {
    return this.afs.collection(`normal-users`).add({
      title: value.title,
      nameToSearch: value.title.toLowerCase(),
      desc: value.desc,
      category: value.category,
      subcategory: value.subcategory,
      name: value.name,
      created_date: this.currentDate,
      imgurl: this.downloadURL,
      uid: this.uid,
      uname: this.uname
    })

  }


  uploadFile() {
    const myTest = this.afs.collection('test').ref.doc();
    const file = this.selectedFile;


    this.filepath = "UauthUsers"

    const filePath = `${this.filepath}/${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().toPromise().then((url) => {
          this.downloadURL = url;
          this.downloadurlchange.next(this.downloadURL)



        }).catch(err => { console.log(err) });
      })
    )
      .subscribe()
  }
}

