import { Component } from '@angular/core';

@Component({
    'selector': 'state-template',
    'template': require('./second.template.html')
})
export class SecondComponent {
    constructor () {
        console.log('Second Component was loaded');
    }
}