import { Component, OnInit } from '@angular/core';
import { UPost } from '../shared/UPost.model';
import { CrudService } from '../shared/crud.service';
import { catchError } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  data: UPost[];
  sorted: UPost[];
  isFetching: boolean = false
  error: string
  constructor(private cd: CrudService) { }

  ngOnInit(): void {
    this.public_data()

  }
  sortDesecending() {
    this.sorted = this.data.sort((a: any, b: any) =>
      b.created_date - a.created_date
    )
    console.log(this.data)

  }
  onReadMore(index) {
    console.log(index)
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
        console.log(this.data)
        this.sortDesecending()
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
