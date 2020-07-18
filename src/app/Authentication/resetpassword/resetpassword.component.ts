import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  isLoading: Boolean = false
  error: string = ""
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {
    this.isLoading = true
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    this.auth.sendPasswordResetEmail(email).then(() => {

      this.isLoading = false
    })
      .catch(e => {
        this.isLoading = false
        this.error = e.message
        this.auth.showerrorForResetMail()

      })

  }
} 
