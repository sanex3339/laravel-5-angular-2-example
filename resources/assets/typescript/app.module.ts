import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes } from './app.routing';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from "./components/page-not-found/page-not-found.component";
import { FirstComponent } from "./components/first/first.component";
import { SecondComponent } from "./components/second/second.component";
import { ProgressBar } from "./components/ui/progress-bar/progress-bar.component";

import { FileUploadService } from "./services/file-upload/file-upload.service";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(routes, {
            useHash: true
        })
    ],
    declarations: [
        AppComponent,
        PageNotFoundComponent,
        FirstComponent,
        SecondComponent,
        ProgressBar
    ],
    providers: [
        FileUploadService
    ],
    bootstrap:[
        AppComponent
    ]
})
export class AppModule {}
