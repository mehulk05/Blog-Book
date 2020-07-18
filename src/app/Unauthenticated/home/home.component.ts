import { Component, OnInit } from '@angular/core';
import { UPost } from '../shared/UPost.model';
import { CrudService } from '../shared/crud.service';
import { catchError } from 'rxjs/operators';
import { ACrudService } from '../../Authentication/shared/acrud.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  data: UPost[];
  sorted: UPost[];
  featuredPost: any
  isFetching: boolean = false
  error: string
  searchText
  featuredPostsorted: any[];
  commenData: any = []
  constructor(private cd: CrudService,
    private acrud: ACrudService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getAllPost()
    this.getFeaturedPost()


  }

  getAllPost() {
    this.isFetching = true;
    this.acrud.getAllPost().then((x: any) => {
      this.isFetching = false
      this.data = x
      this.sortDesecending(this.data)

    })
  }
  sortDesecending(data) {
    this.sorted = data.sort((a: any, b: any) =>
      <any>new Date(b.created_date) - <any>new Date(a.created_date)
    )
  }
  onReadMore(index) {

  }

  getFeaturedPost() {
    this.acrud.getFeaturedPost().then(x => {
      let c = 0
      this.featuredPost = x
      for (let i in this.featuredPost) {
        let y = this.acrud.seprate(this.featuredPost[i].commentData)
        this.commenData.push(y)
      }

    },
      err => {
        console.log(err)
      })


  }

  public_data() {
    this.isFetching = true;
    this.cd.get_public_post()
      .subscribe(result => {
        this.data = result.map(e => {
          return {
            ...e.payload.doc.data() as {}
          } as UPost

        })
        this.isFetching = false;
      },
        err => {
          this.isFetching = false;
          this.error = err

        })
    catchError(error => {
      throw new Error('Error: Getting document:' + error); // throw an Error
    });

  }


}
