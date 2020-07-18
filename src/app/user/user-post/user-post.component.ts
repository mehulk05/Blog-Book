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
  public_post: UPost[] = null
  private_post: UPost[];
  isFetching = true;
  isAll = false;
  isPublic = false;
  isPrivate = false;
  url
  href: string
  error: string
  count_all: number = 0
  count_pr: number = 0
  count_pb: number = 0
  searchText;

  constructor(public acrud: ACrudService,
    private router: Router,
    private route: ActivatedRoute,
    private authservice: AuthService) { }

  ngOnInit(): void {

    this.href = this.router.url;
    this.url = this.href.split("/")
    this.url = this.url[2]
    this.acrud.getDemo1();
    this.acrud.getDemo2()




    this.route.params
      .subscribe(
        (params: Params) => {

          this.url = params['type']
          if (this.url !== 'allpost' && this.url !== 'public' && this.url !== 'private') {
            this.router.navigate(["home"])

          }
          if (this.url === 'allpost') {
            this.getAllPosts()
          }

          if (this.url === 'public') {
            this.getPublicPosts();
          }

          if (this.url === 'private') {
            this.getPriavtePosts()
          }
        });

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
        this.allpost = x3.concat(x4)
        this.sortDesecendingByDate(this.allpost)
        this.count_all = this.allpost.length
        this.isLoading$.next(false);
        this.isFetching = false


      },

        err => {
          this.error = err
        })
  }

  getPublicPosts() {
    this.isLoading$.next(true);

    this.isAll = false;
    this.isPublic = true;
    this.isPrivate = false;
    this.isFetching = true;


    this.puSub = this.acrud.pu.subscribe(d => {
      this.public_post = d
      if (this.public_post) {
        this.sortDesecendingByDate(this.public_post)
      }
      this.isFetching = false;

    },
      error => {
        this.isFetching = false;
        this.error = error;
      },
      () => {
        this.isFetching = false;
      })


  }
  getPriavtePosts() {

    this.isAll = false;
    this.isPublic = false;
    this.isPrivate = true;
    this.isFetching = true;

    this.prSub = this.acrud.pr.subscribe(d => {
      this.private_post = d
      this.count_pr = this.private_post.length
      this.isFetching = false

    },
      error => {
        this.error = error;
        this.isFetching = false
      })
  }


  sortDesecendingByDate(data) {
    return data.sort((a: any, b: any) =>
      <any>new Date(b.created_date) - <any>new Date(a.created_date)
    )
  }
  ngOnDestroy() {

    if (this.puSub && this.public_post) {
      this.puSub.unsubscribe()
    }

    if (this.prSub && this.private_post) {
      this.prSub.unsubscribe()
    }
  }

}
