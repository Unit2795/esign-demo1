import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from "@angular/material/button";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DemoViewComponent } from './demo-view/demo-view.component';
import { MaterialInputComponent } from './material-input/material-input.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatExpansionModule } from "@angular/material/expansion";
import { NgxCaptchaModule } from 'ngx-captcha';
import { LanguagesComponent } from './languages/languages.component';


@NgModule({
  declarations: [
    AppComponent,
    DemoViewComponent,
    MaterialInputComponent,
    LanguagesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgbModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightModule,
    MatExpansionModule,
    NgxCaptchaModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: () => import('highlight.js'),
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
