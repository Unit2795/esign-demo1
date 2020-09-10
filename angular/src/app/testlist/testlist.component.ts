import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-testlist',
  templateUrl: './testlist.component.html',
  styleUrls: ['./testlist.component.sass']
})
export class TestlistComponent implements OnInit {
  // Input decorator. Works a lot like a prop in React

  @Input() myTestArray : Array<string | number>;

  constructor() { }

  ngOnInit(): void {
  }

  onRemove(index: number): void {
    this.myTestArray.splice(index, 1);
  }
}
