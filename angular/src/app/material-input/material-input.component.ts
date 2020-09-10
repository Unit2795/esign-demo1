import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-material-input',
  templateUrl: './material-input.component.html',
  styleUrls: ['./material-input.component.sass']
})
export class MaterialInputComponent implements OnInit {
  @Input() label: string = '';
  @Input() name: string = '';
  @Input() type: string = '';
  @Input() control: string = '';
  @Input() form: FormGroup;


  constructor() { }

  ngOnInit(): void {
  }
}
