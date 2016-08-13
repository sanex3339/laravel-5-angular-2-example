import { Component } from '@angular/core';

@Component({
    'inputs': ['progress'],
    'selector': 'progress-bar',
    'template': require('./progress-bar.template.html')
})
export class ProgressBar {
    /**
     * @type {number}
     */
    private progress: number = 0;
}