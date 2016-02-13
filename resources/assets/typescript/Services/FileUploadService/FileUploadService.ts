import { Component } from 'angular2/core';
import { Injectable } from 'angular2/core';

@Injectable()
export class FileUploadService {
    constructor () {}

    /**
     * PLACEHOLDER for files uploading
     *
     * @returns {Promise<T>}
     */
    public upload (): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 500)
        });
    }
}