import { Component, Inject, Injectable } from 'angular2/core';

@Component({
    'selector': 'state-template',
    'templateUrl': '/templates/SecondComponent.main'
})
export class SecondComponent {
    constructor () {
        console.log('Second Component was loaded');
    }
}