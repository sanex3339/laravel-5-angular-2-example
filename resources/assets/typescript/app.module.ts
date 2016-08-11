import { BrowserModule, platformBrowser } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { routing } from './app.routing';

import { AppComponent } from './app.component';
import { FirstComponent } from "./Components/FirstComponent/FirstComponent";
import { SecondComponent } from "./Components/SecondComponent/SecondComponent";


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        routing
    ],
    declarations: [
        AppComponent,
        FirstComponent,
        SecondComponent
    ],
    providers: [
        {
            provide: platformBrowser,
            useValue: [ROUTER_DIRECTIVES],
            multi: true
        }
    ],
    bootstrap:[
        AppComponent
    ]
})
export class AppModule {}
