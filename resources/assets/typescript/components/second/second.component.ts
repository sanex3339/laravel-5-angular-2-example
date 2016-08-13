import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES }  from '@angular/router';

@Component({
    'selector': 'state-template',
    'template': require('./second.template.html'),
    'directives': [ROUTER_DIRECTIVES]
})
export class SecondComponent {
    constructor () {
        console.log('Second Component was loaded');
    }
}