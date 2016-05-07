import { Component } from '@angular/core';
import { Routes, ROUTER_DIRECTIVES } from '@angular/router';
import { FirstComponent } from './Components/FirstComponent/FirstComponent';
import { SecondComponent } from './Components/SecondComponent/SecondComponent';

@Routes([
    {
        path: '/',
        component: FirstComponent
    },
    {
        path: '/edit',
        component: SecondComponent
    }
])
@Component({
    'directives': [ROUTER_DIRECTIVES],
    'selector': 'app',
    'template': `<a [routerLink]="['/']"></a><router-outlet></router-outlet>`
})
export class AppComponent {
    constructor () {}
}