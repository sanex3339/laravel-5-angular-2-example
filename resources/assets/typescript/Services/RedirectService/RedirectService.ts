import { Component, Inject, Injectable } from 'angular2/core';
import { Router } from 'angular2/router';

@Injectable()
export class RedirectService {
    /**
     * @type Router
     */
    private router: Router;

    constructor (
        @Inject(Router) router: Router
    ) {
        this.router = router;
    }

    /**
     * Redirect on given link route
     *
     * @param link
     * @param delay
     * @returns {Promise<T>}
     */
    public redirect (link: string, delay: number = 800) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.router.navigate([link]);
                resolve();
            }, delay);
        });
    }
}