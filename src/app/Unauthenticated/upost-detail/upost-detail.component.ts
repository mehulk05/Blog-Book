import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./upost-detail.component.css'],

})
export class UPostDetailComponent implements OnInit {
  CommentForm: FormGroup;

  id: number;
  unauthpostss: UPost[];

  private userSub: Subscription;
  post_userid: string

  count: number = 0
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
  ProfileImgUrl: string
  isImgLoaded: boolean = false;
  username: string;
  profileuname: any;
  publicpostOfSingleUser: any;
  isPublicPostOfSingleUser: boolean;
  posttitle: string;
  postdesc: string;
  showComment: boolean = false


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

          this.postype = params['type']


          if (this.xyz[1] == "home") {
            this.getAllPost();
            this.showComment = true
          }

          if (this.xyz[1] == "featured") {
            this.getFeaturedPost()
            this.showComment = true
          }
          if (this.postype === 'allpost') {

            this.getAuthAllPost();
          }

          if (this.postype === 'public') {
            this.acrud.getDemo2()
            this.getAuthPublicPost();
            this.showComment = true
          }

          if (this.postype === 'private') {
            this.acrud.getDemo1();
            this.getAuthPrivatePost();
            this.showComment = false
          }
          if (this.xyz[3] === 'publicposts') {
            this.profileuname = this.xyz[2]
            this.getPostFromProfile(this.profileuname);
            this.showComment = true
          }
        })


    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid
      }
      this.isAuthenticated = !!user;
    })

    if (this.isAuthenticated) {
      this.getUidandUname()
    }

    this.getLikeCountandStatus()
    this.CallCommentForm()
  }

  getUidandUname() {
    this.acrud.getProfile().subscribe(d => {
      let x = this.acrud.seprate(d)

      this.username = x[0].uname

    })
  }
  getLikeCountandStatus() {
    this.acrud.PostDataForLikeCount.subscribe(d => {
      if (d) {
        this.count = d

      }


    })
    this.acrud.PostDataForLikedByUser.subscribe(d => {
      let x = this.acrud.seprate(d)

      for (const i in x) {
        if ((x[i].uid) == this.currentUserId) {
          this.likeStatus = x[i].islike

        }
      }

    })
  }
  getPostFromProfile(uname) {
    this.acrud.getPublicProfile(uname).subscribe(d => {
      let x = this.acrud.seprate(d)
      let y = x[0].id

      this.getPublicPostsFromProfileId(y)

      this.acrud.getPublicProfile(uname).subscribe(
        d => {
          let x = this.acrud.seprate(d)
          this.ProfileImgUrl = x[0]?.imgurl

        }
      )
    })
  }
  getPublicPostsFromProfileId(profileid) {
    this.isPublicPostOfSingleUser = false
    this.acrud.getPublicPostsFromProfileId(profileid).subscribe(d => {
      this.isPublicPostOfSingleUser = true
      let x = this.acrud.seprate(d)
      this.sortDesecendingByDate(x)
      this.publicpostOfSingleUser = x[this.id]
      let id = this.id
      this.posttitle = this.publicpostOfSingleUser.title
      this.postdesc = this.publicpostOfSingleUser.desc
      this.post_userid = this.publicpostOfSingleUser.uid
      this.getComment(this.publicpostOfSingleUser.uid, this.publicpostOfSingleUser.title, this.publicpostOfSingleUser.desc)
      this.acrud.getPostDetailForLike(this.post_userid, this.posttitle, this.postdesc)


    })
  }

  getFeaturedPost() {
    this.isFetching = true


    this.acrud.getFeaturedPost().then((d: any) => {


      this.publicpostOfSingleUser = d[this.id]
      this.acrud.getPublicProfile(this.publicpostOfSingleUser.uname).subscribe(
        d => {
          let x = this.acrud.seprate(d)
          this.ProfileImgUrl = x[0]?.imgurl

        }
      )

      let id = this.id
      this.posttitle = this.publicpostOfSingleUser.title
      this.postdesc = this.publicpostOfSingleUser.desc
      this.post_userid = this.publicpostOfSingleUser.uid
      this.getComment(this.publicpostOfSingleUser.uid, this.publicpostOfSingleUser.title, this.publicpostOfSingleUser.desc)
      this.acrud.getPostDetailForLike(this.post_userid, this.posttitle, this.postdesc)

      this.isFetching = false
    })
  }

  getAllPost() {
    this.isUnauth = true
    this.isFetching = true;
    this.acrud.getAllPost().then((x: any) => {
      this.isFetching = false
      this.sortDesecendingByDate(x)


      this.unauthpost = x[this.id]



      if (this.unauthpost?.uid) {

        this.post_userid = this.unauthpost?.uid
        this.posttitle = this.unauthpost?.title
        this.postdesc = this.unauthpost?.desc

        this.getProfileFromUid(this.post_userid)
        this.postDate = this.unauthpost.created_date

        this.acrud.getPostDetailForLike(this.post_userid, this.posttitle, this.postdesc)

        this.getComment(this.post_userid, this.unauthpost.title, this.unauthpost.desc)

      }
      else {
        this.router.navigate(["home"])
      }
    },
      err => {
        this.isFetching = false
        this.error = err;

      })



  }


  sortDesecendingByDate(data) {
    return data.sort((a: any, b: any) =>
      <any>new Date(b.created_date) - <any>new Date(a.created_date)
    )
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
          this.posttitle = this.unauthpost?.title
          this.postdesc = this.unauthpost?.desc

          this.getProfileFromUid(this.post_userid)
          this.postDate = this.unauthpost.created_date
          this.postDate = this.postDate.toDate()
          this.acrud.getPostDetailForLike(this.post_userid, this.posttitle, this.postdesc)


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

  getComment(postid, title, desc) {
    let CommentKeyPromise = this.acrud.getCommentKey(postid, title, desc)
      .then(d => {
        return new Promise(resolve => {
          resolve(d)

        })

      })

    if (CommentKeyPromise) {


      CommentKeyPromise.then(key => {
        this.acrud.getCommentDataFromKey(postid, key)
          .subscribe((commentData: Comment) => {

            this.Comment_Data = this.acrud.seprate(commentData)

            if (commentData) {
              this.Comment_Data.sort((a, b) => new Date(b.commentOn).getTime() - new Date(a.commentOn).getTime());
            }


            for (let i in this.Comment_Data) {
              this.acrud.getProfileFromUid(this.Comment_Data[i].commentByUserId)
                .subscribe(data => {

                  let x = this.acrud.seprate(data)

                  this.Comment_Data[i].uname = x[0].uname

                })

            }


          })
      })
    }
  }

  getProfileFromUid(postuserid) {

    this.acrud.getProfileFromUid(postuserid)
      .subscribe((data) => {

        let profile = this.acrud.seprate(data)

        this.ProfileImgUrl = profile[0].imgurl


      })
  }
  getAuthPublicPost() {


    this.isAll = false;
    this.isPublic = true;
    this.isPrivate = false;
    this.isFetching = true;

    this.puSub = this.acrud.pu.subscribe(d => {

      if (d) {
        this.sortDesecendingByDate(d)
        this.public_post = d
        if (this.public_post) {

        }
        let id = this.id
        this.posttitle = this.public_post[id].title
        this.postdesc = this.public_post[id].desc
        this.post_userid = this.public_post[id].uid
        this.getComment(this.public_post[id].uid, this.public_post[id].title, this.public_post[id].desc)
        //this.SinglePost=this.public_post[this.id]

        // this.SinglePost = this.public_post[this.id]
      }
    },
      err =>
        this.error = err)

  }

  getAuthAllPost() {
    this.isFetching = true


    this.isAll = true;
    this.isPublic = false;
    this.isPrivate = false;

    this.acrud.getAllData()
      .subscribe(data => {

        this.isFetching = false
        let x1 = data[0]
        let x2 = data[1]
        let x3 = []
        x3 = this.acrud.seprate(x1)
        let x4 = this.acrud.seprate(x2)

        let x5 = x3.concat(x4)
        this.allPost = x5
        this.sortDesecendingByDate(this.allPost)

        let id = this.id
        if (this.allPost[id]?.privacy == "true") {
          this.showComment = true;
        }

        if (this.allPost[id]?.privacy == "false") {
          this.showComment = false;
        }
        this.posttitle = this.allPost[id].title
        this.postdesc = this.allPost[id].desc
        this.post_userid = this.allPost[id].uid
        this.getComment(this.allPost[id].uid, this.allPost[id].title, this.allPost[id].desc)

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


          this.isAll = false;
          this.isPublic = false;
          this.isPrivate = true;
          this.isFetching = true;

          this.prSub = this.acrud.pr.subscribe(d => {
            this.isFetching = false
            this.private_post = d
            this.SinglePost = this.private_post[this.id]

          })

        });

  }
  sortDesecending() {
    this.acrud.sortDesecending(this.unauthpostss)

  }


  Like() {

    if (!this.currentUserId) {
      this.router.navigate(["/auth"])
    }

    else {
      let likestatus = this.likeStatus;

      if (likestatus) {
        this.count = this.count - 1

      }
      else {
        this.count = this.count + 1

      }
      this.likeStatus = !this.likeStatus;
      this.acrud.CreateLikeEntry(this.count, this.likeStatus, this.post_userid, this.posttitle, this.postdesc)

    }
  }





  navigateToProfile(uname: string) {

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
    if (this.isAuthenticated) {
        this.acrud.CreateComment(value, this.currentUserId, this.post_userid, this.posttitle, this.postdesc)
          .then(() => {
            this.CommentForm.reset()
            setTimeout(() => {
              window.location.reload()
            }, 900)
          })
      }  
    else {
      alert("Please Login or create your account to do Comment")
    }
  }

  OnDelete() {

    if (this.xyz[2] == "allpost") {
      this.acrud.passParams(this.xyz[2], this.id)
      this.acrud.deletPostEvent(this.allPost[this.id], this.id)
        .then(d => {
          this.acrud.showSuccessDelete()
        })

    }
    if (this.xyz[2] == "public") {
      this.acrud.passParams(this.xyz[2], this.id)
      this.acrud.deletPostEvent(this.public_post[this.id], this.id).then(d => {
        this.acrud.showSuccessDelete()
      })

    }
    if (this.xyz[2] == "private") {

      this.acrud.passParams(this.xyz[2], this.id)
      this.acrud.deletPostEvent(this.private_post[this.id], this.id)
        .then(d => {
          this.acrud.showSuccessDelete()
        })

    }

  }
  ngOnDestroy() {
    this.userSub.unsubscribe();
    if (this.prSub && this.private_post) {
      this.prSub.unsubscribe()
    }

    if (this.puSub && this.public_post) {
      this.puSub.unsubscribe()
    }

  }


}
