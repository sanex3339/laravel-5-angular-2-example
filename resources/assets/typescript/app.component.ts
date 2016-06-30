import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { FirstComponent } from "./Components/FirstComponent/FirstComponent";
import { SecondComponent } from "./Components/SecondComponent/SecondComponent";

@Component({
    'directives': [ROUTER_DIRECTIVES],
    'selector': 'app',
    'precompile': [
        FirstComponent,
        SecondComponent
    ],
    'template': `<router-outlet></router-outlet>`
})
export class AppComponent {
    constructor () {}
}