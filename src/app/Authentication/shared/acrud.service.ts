import { Injectable } from '@angular/core';
import { UPost, LikeUser, LikeUserDetail } from 'src/app/Unauthenticated/shared/UPost.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CrudService } from 'src/app/Unauthenticated/shared/crud.service';
import { Subscription, Observable, BehaviorSubject, forkJoin, zip } from 'rxjs';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Profile, User1 } from './user.model';
import { ToastrService } from 'ngx-toastr';






@Injectable({
  providedIn: 'root'
})
export class ACrudService {


  postdata = {}
  uid: string

  d1 = []
  d2 = []
  d3 = []
  d4 = []

  url: string
  post_id

  list: any
  OthersUid = new BehaviorSubject<string>(null);
  pu = new BehaviorSubject<any>(null);
  pr = new BehaviorSubject<any>('');
  all = new BehaviorSubject<any>(this.d3);
  all3 = new BehaviorSubject<any>(this.d3);
  username = new BehaviorSubject<string>("");
  PostDataForLikeCount = new BehaviorSubject<number>(null);
  PostDataForLikedByUser = new BehaviorSubject<any>(null);
  db_key: string;
  firestorekey: string;
  x: Observable<{ title: string; desc: string; created_date?: Date; imgurl: string; category: string; subcategory?: string; name: string; privacy: string; id: string; }[]>;
  ProfieData: { id: string; uname: string; desc: string; email: string; name: string; created_date?: Date; imgurl: Observable<string>; isProfileSet: boolean };
  editedProfileData: { id: string; uname: string; desc: string; email: string; name: string; imgurl: Observable<string>; created_date?: Date; isProfileSet: boolean; };
  uname: any;
  id: any;
  commentData: { comment: string; commentOn: Date; commentByUserId: string; };
  acrud: any;
  featuredPost: any;
  featuredPostsorted: any[];





  constructor(private http: HttpClient,

    private ucrud: CrudService,
    private authService: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private toastr: ToastrService) {


    setTimeout(() => {
      this.authService.user.subscribe(data => {

        if (data) {
          this.uid = data.id
        }


      }

      )
    }, 2000)



  }
  getUid() {
    return new Promise(res => {
      this.authService.user.subscribe((user) => {
        if (user) {

          this.uid = user.uid


        }
        res(this.uid)

      })

    })
  }
  sortDesecending(Post) {


    Post.sort((a: any, b: any) =>
      b.created_date - a.created_date
    )


    return Post
  }


  createProfile(value: Profile) {
    this.getUid()
    this.ProfieData = {
      id: this.uid,
      uname: value.uname,
      desc: value.desc,
      email: value.email,
      name: value.name,
      created_date: this.ucrud.currentDate,
      imgurl: this.ucrud.downloadURL,
      isProfileSet: true

    }
    this.createPublicProfile(this.ProfieData, this.ProfieData.uname)
    this.getUid().then(d => {


      this.http.post(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/profile.json`,
        this.ProfieData
      )

        .subscribe(responseData => {

          this.showSuccessCreateProfile()
        });
    })



  }

  createPublicProfile(postdata: any, uname) {

    this.http.post(
      `https://write-your-heart-out-b338b.firebaseio.com/PublicProfile/${uname}.json`,
      postdata
    )

      .subscribe(responseData => {


      });

  }

  getProfile(): Observable<Profile[]> {

    this.getUid()
    if (this.uid) {


      return this.http.get<Profile[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/profile.json`)
    }
    else {
      this.getUid().then((d: any) => {

        this.uid = d
        return this.http.get<Profile[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/profile.json`)
      })
    }

  }
  createPost(value: UPost) {
    this.postdata = {
      title: value.title,
      nameToSearch: value.title.toLowerCase(),
      desc: value.desc,
      category: value.category,
      subcategory: value.subcategory,
      name: value.name,
      created_date: this.ucrud.currentDate,
      imgurl: this.ucrud.downloadURL,
      privacy: value.privacy,
      uid: this.id,
      uname: this.uname,

    }
    if (value.privacy == "true") {
      this.getUid().then((d: any) => {
        this.uid = d
        this.http.post(
          `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`,
          this.postdata
        )
          .subscribe(responseData => {

            this.router.navigate(['']);
            this.showSuccess();
          }
            , err => {

            })
          ;
      })


    }
    else {

      this.http.post(
        `https://write-your-heart-out-b338b.firebaseio.com/post//${this.uid}/private.json`,
        this.postdata
      )
        .subscribe(responseData => {

          this.router.navigate(['']);
        });
    }
  }
  getPublicPost(): Observable<UPost[]> {
    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`)

  }

  getPrivatePost(): Observable<UPost[]> {
    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private.json`)

  }

  getAllData() {
    this.getUid()
    let x = this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`)
    let y = this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private.json`)
    return forkJoin(x, y)


  }
  seprate(x1) {
    let x3 = []
    for (const key in x1) {

      if (x1.hasOwnProperty(key)) {
        x3.push({ ...x1[key] });
      }
    }
    return x3

  }

  getDemo1() {
    this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private.json`)
      .pipe(
        map(responseData => {
          const postsArray: UPost[] = [];
          for (const key in responseData) {

            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key] });
            }
          }
          return postsArray;
        })
      )
      .subscribe(posts => {
        this.d1 = posts

        this.pr.next(posts)
        this.combine()

        return this.d1;
      });
  }

  getDemo2() {
    this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`)
      .pipe(
        map(responseData => {
          const postsArray: UPost[] = [];
          for (const key in responseData) {

            if (responseData.hasOwnProperty(key)) {
              postsArray.push({ ...responseData[key] });
            }
          }
          return postsArray;
        })
      )
      .subscribe(posts => {
        this.pu.next(posts)
        this.d2 = posts

        this.combine()

        return this.d2;
      });
  }

  combine() {
    this.d3 = this.d2.concat(this.d1)
    this.all.next(this.d3)
  }


  update(id, value, formvalue, imgurl) {


    this.postdata = {
      title: formvalue.title,
      nameToSearch: formvalue.title.toLowerCase(),
      desc: formvalue.desc,
      category: formvalue.category,
      subcategory: formvalue.subcategory,
      name: formvalue.name,
      imgurl: imgurl,
      privacy: formvalue.privacy,
      created_date: this.ucrud.currentDate,
      uid: value.uid,
      uname: value.uname

    }

    this.Comare_In_FireStore(value, formvalue)

    if (value.privacy == "true") {
      if (formvalue.privacy == "true") {

        let c = this.pb(id, value)
        this.Edit_Public_Post(this.postdata, c)
        this.EditInFireStore(this.postdata, value)

      }
      else {

        this.Create_Private_Post(this.postdata)
        let c = this.pb(id, value)
        this.deletePublicPost(this.postdata, c)
        this.deleteFromFireStore(value)

      }
    }
    else {
      if (formvalue.privacy == "false") {
        let c = this.getpr(value)
        this.Edit_Private_Post(this.postdata, c)
      }
      else {
        this.Create_Public_Post(this.postdata)
        let c = this.getpr(value)
        this.deletePrivatePost(this.postdata, c)
        this.CreateInFireStore(this.postdata)

      }

    }
  }

  EditInFireStore(postdata: {}, value) {

    this.x.subscribe((querySnapshot) => {

      for (const key in querySnapshot) {

        if (querySnapshot[key].title == value.title && querySnapshot[key].name == value.name) {
          this.firestorekey = querySnapshot[key].id
          this.afs.collection("normal-users").doc(this.firestorekey).update(postdata)
        }

      }


    });

  }
  CreateInFireStore(postdata: {}) {
    this.afs.collection("normal-users").add(postdata).then(
      r => {

      }).catch(e => {
      })

  }


  deleteFromFireStore(value) {
    this.x.subscribe((querySnapshot) => {

      for (const key in querySnapshot) {

        if (querySnapshot[key].title == value.title && querySnapshot[key].name == value.name) {
          this.firestorekey = querySnapshot[key].id
          this.afs.collection("normal-users").doc(this.firestorekey).delete()
        }

      }
    });

  }
  deletePublicPost(postdata: {}, c: Observable<void>) {
    c.subscribe(x => {
      this.http.delete(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public/${this.db_key}.json`)
        .subscribe(d => {
          this.router.navigate(['myposts']);
        })
    })
  }

  deletePrivatePost(postdata: {}, c: Observable<void>) {
    c.subscribe(x => {
      this.http.delete(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private/${this.db_key}.json`)
        .subscribe(d => {

          this.router.navigate(['myposts']);
        })
    })
  }

  Edit_Private_Post(postdata: {}, c) {
    c.subscribe(x => {
      this.http.patch(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private/${this.db_key}.json`, postdata)
        .subscribe(d => {
          this.router.navigate([`myposts/${this.url}/${this.post_id}`]);
          this.showSuccessEdit()
        })
    })
  }
  Edit_Public_Post(postdata: {}, c) {
    c.subscribe(x => {
      this.http.patch(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public/${this.db_key}.json`, postdata)
        .subscribe(d => {
          this.router.navigate([`myposts/${this.url}/${this.post_id}`]);
          this.showSuccessEdit()
        })
    })

  }
  Create_Private_Post(postdata: {}) {
    this.http.post(
      `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private.json`,
      this.postdata
    )
      .subscribe(responseData => {


      });
  }

  Create_Public_Post(postdata: {}) {
    this.http.post(
      `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`,
      postdata
    )
      .subscribe(responseData => {

      });
  }

  Comare_In_FireStore(value, formvalue) {
    this.x = this.afs.collection("normal-users").snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as {};
        const id = a.payload.doc.id;
        return { id, ...data as UPost };
      });
    }))
  }

  pb(id, value) {
    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`)
      .pipe(
        map(responseData => {

          for (const key in responseData) {
            if (responseData[key].title == value.title) {
              this.db_key = key

            }
            else {
              console.log("no data  ")
            }

          }

        })
      )
  }

  getpr(value) {
    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private.json`)
      .pipe(
        map(responseData => {

          for (const key in responseData) {
            if (responseData[key].title == value.title) {
              this.db_key = key

            }
            else {
              console.log("no data  ")
            }

          }

        })
      )
  }

  passParams(url: string, id: number) {
    this.url = url;
    this.post_id = id;
  }
  UpdateProfile(value, oldvalue, imgdownloadurl) {
    this.editedProfileData = {
      id: oldvalue.id,
      uname: value.uname,
      desc: value.desc,
      email: value.email,
      name: value.name,
      imgurl: imgdownloadurl,
      isProfileSet: true,
      created_date: oldvalue.created_date,
    }

    let uname = oldvalue.uname
    let newuname = value.uname
    console.log(imgdownloadurl)

    let c = this.getProfileKey(value, oldvalue.uname)

    let c2 = this.getPublicProfileKey(value, oldvalue.uname)
    c.subscribe(d => {

      this.http.delete(
        `https://write-your-heart-out-b338b.firebaseio.com/PublicProfile/${uname}.json`
      )

        .subscribe(responseData => {

        });

      this.createPublicProfile(this.editedProfileData, newuname)
      this.http.patch(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/profile/${this.db_key}.json`,
        this.editedProfileData
      )
        .subscribe(responseData => {

          this.username.next(newuname)
          this.router.navigate(['/myprofile', newuname]);
          this.showSuccessEditProfile()
        });


    })

  }
  getPublicProfileKey(value: any, uname: any) {

    return this.http.get<Profile[]>(`https://write-your-heart-out-b338b.firebaseio.com/PublicProfile/${uname}.json`)
      .pipe(
        map(responseData => {

          for (const key in responseData) {
            if (responseData[key].uname == uname) {
              this.db_key = key
            }
            else {
              console.log("no data  ")
            }

          }

        })
      )
  }

  getProfileKey(value: any, uname: any) {
    return this.http.get<Profile[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/profile.json`)
      .pipe(
        map(responseData => {

          for (const key in responseData) {
            if (responseData[key].uname == uname) {
              this.db_key = key



            }
            else {
              console.log("no data  ")
            }

          }

        })
      )
  }



  getPublicProfile(uname): Observable<Profile[]> {

    return this.http.get<Profile[]>(`https://write-your-heart-out-b338b.firebaseio.com/PublicProfile/${uname}.json`)
  }

  getProfileFromUid(uid): Observable<UPost[]> {

    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${uid}/profile.json`)
  }

  getPublicPostsFromProfileId(uid): Observable<UPost[]> {
    this.uid = uid
    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/public.json`)
  }

  getPrivateFromProfileId(uid): Observable<UPost[]> {
    this.uid = uid
    return this.http.get<UPost[]>(`https://write-your-heart-out-b338b.firebaseio.com/post/${this.uid}/private.json`)
  }


  sendUidandUname(uname, id) {
    this.uname = uname
    this.id = id
  }

  CreateLikeEntry(likecount, likestatus, postuserid, title, desc) {
    this.getUid()
    let likedata: LikeUser = {
      count: likecount
    }

    let userdata = {

      islike: likestatus,
      uid: this.uid,
    }

    let postid
    let x = this.getPostId(postuserid, title, desc)
    x.subscribe(post => {


      for (const key in post) {
        if ((post[key].title == title) && (post[key].desc == desc)) {
          postid = key

        }
      }

      this.http.patch(
        `https://write-your-heart-out-b338b.firebaseio.com/post/${postuserid}/public/${postid}/likestatus.json`,
        likedata)

        .subscribe(responseData => {
        });

      this.PostDataForLikedByUser.subscribe(d => {
        let userlikedetailkey
        let allusrid = []
        // 
        for (const key in d) {
          if (d[key].uid == this.uid) {
            userlikedetailkey = key
            allusrid = allusrid.concat(d[key].uid)
          }
        }
        const found = allusrid.some(el => el === this.uid);
        if (found) {
          this.http.put(
            `https://write-your-heart-out-b338b.firebaseio.com/post/${postuserid}/public/${postid}/likestatus/uid/${userlikedetailkey}.json`,
            userdata
          ).subscribe(d => {

          })
        }

        if (!found) {
          this.http.post(
            `https://write-your-heart-out-b338b.firebaseio.com/post/${postuserid}/public/${postid}/likestatus/uid.json`,
            userdata
          ).subscribe(d => {

          })
        }
        let x = this.seprate(d)

      })


    })
  }

  getLike(postuserid, title, desc) {
    let dbkey
    this.http.get(
      `https://write-your-heart-out-b338b.firebaseio.com/post/${postuserid}/public.json`)
      .subscribe(post => {
        for (const key in post) {
          if ((post[key].title == title) && (post[key].desc == desc)) {
            dbkey = key
          }
        }

        return this.http.get(
          `https://write-your-heart-out-b338b.firebaseio.com/post/${postuserid}/public/${dbkey}/likestatus.json`)
      })
  }

  getPostId(postuserid, title, desc) {
    return this.http.get(
      `https://write-your-heart-out-b338b.firebaseio.com/post/${postuserid}/public.json`)
  }

  getPostDetailForLike(postid, title, desc) {

    let x = this.getPostId(postid, title, desc)
    let dbkey
    x.subscribe(post => {


      for (const key in post) {

        if ((post[key].title == title) && (post[key].desc == desc)) {
          dbkey = key

        }
      }
      if (dbkey) {
        this.http.get(`https://write-your-heart-out-b338b.firebaseio.com/post/${postid}/public/${dbkey}.json`)
          .subscribe((data: any) => {

            this.PostDataForLikeCount.next(data.likestatus?.count)
            this.PostDataForLikedByUser.next(data.likestatus?.uid)
          })
      }
    })
  }


  CreateComment(value, currentUserId, post_userid, title, desc) {
    return new Promise(res => {


      this.getUid()
      this.uid = currentUserId

      this.commentData = {
        comment: value.comment,
        commentOn: this.ucrud.currentDate,
        commentByUserId: currentUserId
      }
      let dbkey
      this.getCommentKey(post_userid, title, desc).
        then(d => {
          dbkey = d
          this.http.post(`https://write-your-heart-out-b338b.firebaseio.com/post/${post_userid}/public/${dbkey}/commentData.json`, this.commentData)
            .subscribe((data: any) => {
              this.getCommentDataFromKey(post_userid, dbkey)
              res(true)
            })
        })

    })
  }

  getCommentDataFromKey(post_userid, dbkey) {
    return this.http.get(`https://write-your-heart-out-b338b.firebaseio.com/post/${post_userid}/public/${dbkey}/commentData.json`)
  }
  getCommentKey(post_userid: any, title: any, desc: any) {
    return new Promise(resolve => {

      let x = this.getPostId(post_userid, title, desc)
      let dbkey
      x.subscribe(post => {

        for (const key in post) {

          if ((post[key].title == title) && (post[key].desc == desc)) {
            dbkey = key
          }
        }

        resolve(dbkey)

      })
    })

  }

  deletPostEvent(value, id): any {
    return new Promise(res => {
      if (value.privacy == "true") {

        let c = this.pb(id, value)
        this.Comare_In_FireStore(value, c)
        this.deleteFromFireStore(value)
        res(this.deletePublicPost(value, c))

      }
      if (value.privacy == "false") {
        let c = this.getpr(value)
        res(this.deletePrivatePost(value, c))
      }

    })

  }

  getFeaturedPost() {
    return new Promise(resolve => {
      this.http.get(
        `https://write-your-heart-out-b338b.firebaseio.com/post.json`).subscribe(d => {
          let x = this.seprate(d)

          let z = []
          for (let i in x) {

            let featured = x[i].public

            z = z.concat(this.seprate(featured))

            this.featuredPost = z
            let s = []
            for (let a in this.featuredPost) {

              if (this.featuredPost[a].likestatus?.count > 10) {
                s = s.concat(this.featuredPost[a])
                this.featuredPostsorted = s
              }

            }
          }
          resolve(this.featuredPostsorted)


        })

    })


  }

  getAllPost() {
    return new Promise(resolve => {
      this.http.get(
        `https://write-your-heart-out-b338b.firebaseio.com/post.json`).subscribe(d => {
          let x = this.seprate(d)

          let z = []
          for (let i in x) {

            let featured = x[i].public

            z = z.concat(this.seprate(featured))
          }
          resolve(z)

        })
    })
  }


  showSuccess() {
    this.toastr.success('Post Added Successfully', 'Success', {
      timeOut: 20000
    });
  }


  showSuccessDelete() {
    this.toastr.success('Post Deleted Successfully', 'Success', {
      timeOut: 20000
    });
  }

  showSuccessEdit() {
    this.toastr.success('Post Edited Successfully', 'Success', {
      timeOut: 20000
    });
  }

  showSuccessCreateProfile() {
    this.toastr.success('Profile Created Successfully', 'Success', {
      timeOut: 20000
    });
  }
  showSuccessEditProfile() {
    this.toastr.success('Profile Edited Successfully', 'Success', {
      timeOut: 20000
    });
  }

  showWarningForProfileSet() {
    this.toastr.warning('Please set your Profile', 'Warning', {
      timeOut: 20000
    });
  }

}

