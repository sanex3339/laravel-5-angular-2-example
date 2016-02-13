import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';
import { FirstComponent } from './Components/FirstComponent/FirstComponent';
import { SecondComponent } from './Components/SecondComponent/SecondComponent';

@RouteConfig([
    {
        path: '/',
        name: 'Root',
        component: FirstComponent,
        useAsDefault: true
    },
    {
        path: '/edit',
        name: 'Edit',
        component: SecondComponent
    }
])
@Component({
    'directives': [ROUTER_DIRECTIVES],
    'selector': 'app',
    'template': '<router-outlet></router-outlet>'
})
export class AppComponent {
    constructor () {}
}