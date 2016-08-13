import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/delay';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FileUploadService {
    private http: Http;

    constructor (http: Http) {
        this.http = http;
    }

    /**
     * PLACEHOLDER for files uploading
     *
     * @returns {Observable<Response>}
     */
    public upload (): Observable<{}> {
        return this.http
            .post('/api/upload-file', '')
            .map(FileUploadService.extractData);
    }

    private static extractData (res: Response): any {
        let body = res.json();

        return body.message || {};
    }
}
