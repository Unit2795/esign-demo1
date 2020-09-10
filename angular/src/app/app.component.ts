import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'eSign Genie API Demo';
  newArray = []

  onKey(event: any) {
    if (event.key === 'Enter') {
      this.newArray.push(event.target.value);
      event.target.value = '';
    }
  }
}
