import { Component, OnInit } from '@angular/core';
import { UPost } from 'src/app/Unauthenticated/shared/UPost.model';
import { HttpClient } from '@angular/common/http';
import { CrudService } from 'src/app/Unauthenticated/shared/crud.service';
import { AuthService } from 'src/app/Authentication/shared/auth.service';
import { ACrudService } from 'src/app/Authentication/shared/acrud.service';
import { map, take } from 'rxjs/operators';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-user-post',
  templateUrl: './user-post.component.html',
  styleUrls: ['./user-post.component.css']
})
export class UserPostComponent implements OnInit {
  selectedIndex: number = 0;
  type = ['allpost', 'public', 'private']

  private puSub: Subscription;
  private prSub: Subscription
  private allSub: Subscription;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  allpost: UPost[];
  public_post: UPost[]
  private_post: UPost[];
  isFetching = true;
  isAll = false;
  isPublic = false;
  isPrivate = false;
  url
  href: string
  error: string
  count_all:number=0
  count_pr:number=0
  count_pb:number=0


  constructor(public acrud: ACrudService,
    private router: Router,
    private route: ActivatedRoute, ) { }

  ngOnInit(): void {
    this.href = this.router.url;
    this.url = this.href.split("/")
    this.url = this.url[2]
    
    //this.acrud.getAllData()
    


  this.route.params
    .subscribe(
      (params: Params) => {
        console.log(params)
      
        this.url = params['type']
        console.log(this.url);
        if(this.url!=='allpost' && this.url!=='public' && this.url!=='private'){
          this.router.navigate(["home"])

        }
      });
  
      this.acrud.getDemo1();
      
      this.acrud.getDemo2()
    if(this.url==='allpost'){
      this.getAllPosts()
    }

    if(this.url==='public'){
     
      this.getPublicPosts();
    }

    if(this.url==='private'){
     
      this.getPriavtePosts()
    }

    console.log("oninitnt methid")

    
    
    

    
    


  }
  getAllPosts() {
    this.isLoading$.next(true);
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
     //   console.log(x3)


        this.allpost = x3.concat(x4)
        this.count_all=this.allpost.length
        console.log(this.allpost)
        this.isLoading$.next(false);
        this.isFetching = false
     //   console.log(this.d4)

      },

        err => {
          this.error = err
        })













   
   /*  console.log("all post")
    this.isFetching = true;
    this.isAll = true;
    this.isPublic = false;
    this.isPrivate = false;



    this.allSub = this.acrud.all.subscribe(d => {
      this.allpost = d
      this.isFetching = false;
      console.log("####################", d)
    },
      error => {
        this.error = error;
      },
      () => {
        console.log("complete")
        this.isLoading$.next(false);
    })
 */
    //this.acrud.sortDesecending(this.allpost)
  }
  /* subscribe(data=>{
    console.log(data)
  })
} */


  getPublicPosts() {
    this.isLoading$.next(true);
    /*    this.router.navigate(["../public"], { relativeTo: this.r }); */
    console.log("public post")
    this.isAll = false;
    this.isPublic = true;
    this.isPrivate = false;
    this.isFetching = true;


    this.puSub = this.acrud.pu.subscribe(d => {
      this.public_post = d
      this.count_pb=this.public_post.length
      this.isFetching = false;
      console.log("===========================#", d)
    },
      error => {
        this.error = error;
      },
      () => {
        console.log("complete")
        this.isLoading$.next(false);
    })
    //this.acrud.sortDesecending(this.public_post)

  }
  getPriavtePosts() {

    /* this.router.navigate(["../private"], { relativeTo: this.r }); */
    console.log("private post")
    this.isAll = false;
    this.isPublic = false;
    this.isPrivate = true;
    this.isFetching = true;

    this.prSub = this.acrud.pr.subscribe(d => {
      this.private_post = d
      this.count_pr=this.private_post.length
      console.log("-------------------", d)
      //  this.acrud.sortDesecending(this.private_post)
    } ,
      error => {
        this.error = error;
      })
  }


  ngOnDestroy() {
//   this.allSub.unsubscribe();
     /* this.puSub.unsubscribe();
     this.prSub.unsubscribe(); */
  }
  /* 
    OnChangeRoute(id){
  console.log(this.route)
  
      this.router.navigate([ id ], { relativeTo: this.route });
    } */
}
