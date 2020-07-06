import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CrudService } from '../shared/crud.service';
import { UPost, LikeUser } from '../shared/UPost.model';
import { ACrudService } from 'src/app/Authentication/shared/acrud.service';

import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Authentication/shared/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-upost-detail',
  templateUrl: './upost-detail.component.html',
  styleUrls: ['./upost-detail.component.css']
})
export class UPostDetailComponent implements OnInit {
  CommentForm: FormGroup;

  id: number;
  unauthpostss: UPost[];

  private userSub: Subscription;
  post_userid: string

  count: number
  SinglePost: any
  private puSub: Subscription;
  private prSub: Subscription
  private allSub: Subscription;

  allPost: UPost[];
  public_post: UPost[]
  private_post: UPost[];
  isFetching = false;
  isAll = true;
  isPublic = false;
  isPrivate = false;
  isUnauth = false
  error: string
  errorkey: string


  href
  xyz
  LikeData: any;
  isAuthenticated: boolean;
  currentUserId: string;
  likeStatus: any;
  postype: any;
  Comment_Data: any[];
  unauthpost: UPost;
  postDate: any;
ProfileImgUrl:string
  isImgLoaded: boolean=false;

  /*   LikeData: {count:number,uid:{islike:boolean,uid:string}}; */
  constructor(private route: ActivatedRoute,
    private router: Router,
    private cd: CrudService,
    public acrud: ACrudService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) { }


  ngOnInit() {




    this.href = this.router.url;
    this.xyz = this.href.split("/")
    this.id = this.xyz[2]
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];
          console.log(this.id)
          this.postype = params['type']
          console.log(this.postype)

          if (this.xyz[1] == "home") {
            this.getUauthPublicPost();
          }

          if (this.postype === 'allpost') {

            this.getAuthAllPost();
          }

          if (this.postype === 'public') {
            this.acrud.getDemo2()
            this.getAuthPublicPost();
          }

          if (this.postype === 'private') {
            this.acrud.getDemo1();
            this.getAuthPrivatePost();
          }
        })

    console.log(this.xyz);

    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.currentUserId = user.id
      }
      this.isAuthenticated = !!user;
    })

    this.getLikeCountandStatus()
    this.CallCommentForm()
  }

  getLikeCountandStatus() {
    this.acrud.PostDataForLikeCount.subscribe(d => {
      this.count = d
      console.log(d)

    })
    this.acrud.PostDataForLikedByUser.subscribe(d => {
      let x = this.acrud.seprate(d)
      console.log(x)
      for (const i in x) {
        if ((x[i].uid) == this.currentUserId) {
          this.likeStatus = x[i].islike
          console.log(this.likeStatus)
        }
      }

    })
  }

  getUauthPublicPost() {
    this.isUnauth = true
    this.isFetching = true;
    this.cd.get_public_post()
      .subscribe(result => {

        this.unauthpostss = result.map(e => {
          return {
            ...e.payload.doc.data() as {}
          } as UPost



        },
          err => {
            this.error = err;
          })
        this.isFetching = false
        this.sortDesecending()

        this.unauthpost = this.unauthpostss[this.id];
        if (this.unauthpost == undefined) {
          this.router.navigate(["home"])
        }
        let CommentKeyPromise
        if (this.unauthpost?.uid) {

          this.post_userid = this.unauthpost?.uid
          this.getProfileFromUid(this.post_userid)
          this.postDate = this.unauthpost.created_date
          this.postDate = this.postDate.toDate()
          this.acrud.getPostDetailForLike(this.post_userid, this.unauthpost.title, this.unauthpost.desc)

          console.log(this.post_userid, this.currentUserId, this.unauthpost.title, this.unauthpost.desc)
         this.getComment(this.post_userid, this.unauthpost.title, this.unauthpost.desc)

        }
        else {
          this.router.navigate(["home"])
        }
      }
        , err => {
          this.errorkey = err;
        });

  }

  getComment(postid,title,desc){
  let  CommentKeyPromise = this.acrud.getCommentKey(postid, title, desc)
    .then(d => {
      return new Promise(resolve => {
        resolve(d)
        console.log(d)
      })

    })

    if (CommentKeyPromise) {


      CommentKeyPromise.then(key => {
        this.acrud.getCommentDataFromKey(postid, key)
          .subscribe((commentData: Comment) => {
            console.log(commentData)
            this.Comment_Data = this.acrud.seprate(commentData)

            if (commentData) {
              this.Comment_Data.sort((a, b) => new Date(b.commentOn).getTime() - new Date(a.commentOn).getTime());
            }


            for (let i in this.Comment_Data) {
              this.acrud.getProfileFromUid(this.Comment_Data[i].commentByUserId)
                .subscribe(data => {

                  let x = this.acrud.seprate(data)

                  this.Comment_Data[i].uname = x[0].uname
                  console.log(this.Comment_Data[i].uname)
                })

            }


          })
      })
    }
  }

getProfileFromUid(postuserid){
this.acrud.getPrivateFromProfileId(postuserid)
.subscribe((data)=>{
  let profile=this.acrud.seprate(data)
  this.ProfileImgUrl=profile[0].imgurl
 
})
  }
  getAuthPublicPost() {

    console.log("public post")
    this.isAll = false;
    this.isPublic = true;
    this.isPrivate = false;
    this.isFetching = true;

    this.puSub = this.acrud.pu.subscribe(d => {
      
      if(d)
      {
        this.public_post = d
      let id=this.id
      this.getComment(this.public_post[id].uid,this.public_post[id].title,this.public_post[id].desc)
      //this.SinglePost=this.public_post[this.id]
      console.log("===========================#", this.public_post)
      // this.SinglePost = this.public_post[this.id]
    }
  },
      err =>
        this.error = err)

  }

  getAuthAllPost() {
    this.isFetching = true

    console.log(this.isFetching)
    this.isAll = true;
    this.isPublic = false;
    this.isPrivate = false;

    this.acrud.getAllData()
      .subscribe(data => {
        console.log(data)
        this.isFetching = false
        let x1 = data[0]
        let x2 = data[1]
        let x3 = []
        x3 = this.acrud.seprate(x1)
        let x4 = this.acrud.seprate(x2)

        let x5 = x3.concat(x4)
        this.allPost = x5
        console.log(this.allPost)
      },

        err => {
          this.error = err
        })
  }







  getAuthPrivatePost() {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = +params['id'];

          console.log("private post")
          this.isAll = false;
          this.isPublic = false;
          this.isPrivate = true;
          this.isFetching = true;

          this.prSub = this.acrud.pr.subscribe(d => {
            this.isFetching = false
            this.private_post = d
            this.SinglePost = this.private_post[this.id]
            console.log("####################", this.SinglePost)

            console.log("-------------------", d)

          })
          //      this.SinglePost = this.private_post[this.id]
          console.log("-----------------", this.SinglePost)
        });

  }
  sortDesecending() {
    this.acrud.sortDesecending(this.unauthpostss)

  }

  OnLike(value, Likecount) {

  }

  Like() {
    
    if (!this.currentUserId) {
      this.router.navigate(["/auth"])
    }

    else {
      let likestatus = this.likeStatus;
      console.log(likestatus)
      if (likestatus) {
        this.count = this.count - 1
        console.log("liked", likestatus, this.count)

      } 
      else {
        this.count = this.count + 1
        console.log("UNlike", likestatus, this.count)
      }
      this.likeStatus = !this.likeStatus;
      this.acrud.CreateLikeEntry(this.count, this.likeStatus, this.post_userid, this.unauthpost.title, this.unauthpost.desc)

    }
  }





  navigateToProfile(uname: string) {
    console.log(uname)
    if (uname) {
      this.router.navigate(['myprofile', uname])
    }
    else {
    
      this.router.navigate(["/home"])
    }

  }

  CallCommentForm() {
    this.CommentForm = this.fb.group({
      comment: ['', Validators.required],
    })
  }



  onSubmit(value: Comment) {
    if(this.isAuthenticated){

    
    console.log(value)
    console.log(this.isAuthenticated)
    if (this.isAuthenticated) {

      this.acrud.CreateComment(value, this.currentUserId, this.post_userid, this.unauthpost.title, this.unauthpost.desc)
        .then(() => {
          this.CommentForm.reset()

          setTimeout(() => {
            window.location.reload()
          }, 900)

        })
    }
    else {
      this.router.navigate(["/home"])
    }
  }
  else{
    alert("Please Login or create your account to do Comment")
  }
  }

  onImageLoad(evt){
  /*   if (evt && evt.target) {
      this.isImgLoaded=false
    } */
  }
  ngOnDestroy() {

    if (this.prSub && this.private_post) {
      this.prSub.unsubscribe()
    }

    if (this.puSub && this.public_post) {
      this.puSub.unsubscribe()
    }
  }
}
