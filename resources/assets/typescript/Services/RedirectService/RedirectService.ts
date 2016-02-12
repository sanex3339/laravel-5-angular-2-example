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
     * Redirect on given link route with given data
     *
     * @param link
     * @param data
     * @param delay
     * @returns {Promise<T>}
     */
    public redirect (link: string, data: any, delay: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.router.navigate([link]);
                resolve(data);
            }, delay);
        });
    }
}