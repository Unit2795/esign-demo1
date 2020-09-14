import {Component, Inject, OnInit} from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-demo-view',
  templateUrl: './demo-view.component.html',
  styleUrls: ['./demo-view.component.sass']
})
export class DemoViewComponent implements OnInit {
  activeIndex: number = 0;
  demoForm = new FormGroup({
    fname: new FormControl(''),
    lname: new FormControl(''),
    start: new FormControl(''),
    email: new FormControl(''),
    comments: new FormControl(''),
    services: new FormControl('false')
  });
  signingUrl: string = '';
  captchaSuccess: boolean = false;
  captchaToken: string = "";

  onCaptchaFail()
  {
    this.captchaSuccess = false;
  }

  onCaptchaSuccess(event: any)
  {
    this.captchaToken = event;
    this.captchaSuccess = true;
  }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', (event) => {
      document.querySelectorAll('pre code').forEach((block) => {
        // @ts-ignore
        hljs.highlightBlock(block);
      });
    });
  }

  setActiveIndex(index: number)
  {
    this.activeIndex = index;
  }

  async submitForm(event: any) {
    if (this.demoForm.value.fname.trim().length < 1 || this.demoForm.value.lname.trim().length < 1)
    {
      return alert('Please provide your name');
    }
    else if (this.demoForm.value.email.trim().length < 3)
    {
      return alert('Please provide a valid email address');
    }

    let formattedDate = "";
    if (this.demoForm.value.start !== "")
    {
      let {_d} = this.demoForm.value.start;
      formattedDate = `${(_d.getMonth() + 1)}-${(_d.getDate())}-${(_d.getFullYear())}`;
    }


    let body = JSON.stringify({
      "fname": this.demoForm.value.fname,
      "lname": this.demoForm.value.lname,
      "start": formattedDate,
      "services": this.demoForm.value.services,
      "email": this.demoForm.value.email,
      "comments": this.demoForm.value.comments
    });


    let options = {
      "method": "post",
      "headers": {
        "Authorization": this.captchaToken,
        "Origin": "esign1.djoz.us",
        "Content-Type": "application/json",
      },
      "body": body
    };

    let response;
    try {
      response = await fetch('https://o0d03o9f5j.execute-api.us-east-1.amazonaws.com/dev/demoform', options);
    }
    catch (e) {
      return alert("Request failed");
    }

    let url = await response.text();

    // @ts-ignore
    grecaptcha.reset();
    this.captchaToken = '';
    this.captchaSuccess = false;

    console.log(url);
    this.signingUrl = url;
    document.getElementById('esignIframe').setAttribute('src', url);
  }

  clearSigning() {
    this.signingUrl = ''
  }
}
