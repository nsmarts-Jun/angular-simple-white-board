import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './material/material.module';
import { FileUploadModule } from 'ng2-file-upload';
import { IconModule } from '@visurel/iconify-angular';

// Component
import { AppComponent } from './app.component';
import { BoardNavComponent } from './components/board-nav/board-nav.component';
import { BoardSlideViewComponent } from './components/board-slide-view/board-slide-view.component';
import { BoardFabsComponent } from './components/board-fabs/board-fabs.component';
import { BoardCanvasComponent } from './components/board-canvas/board-canvas.component';

import { DragScrollDirective } from 'src/@wb/directives/drag-scroll.directive';


@NgModule({
  declarations: [
    AppComponent,
    BoardNavComponent,
    BoardSlideViewComponent,
    BoardCanvasComponent,
    BoardFabsComponent,
    DragScrollDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    FileUploadModule,
    IconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
