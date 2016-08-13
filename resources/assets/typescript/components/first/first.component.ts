import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload/file-upload.service';
import { ProgressBar } from '../ui/progress-bar/progress-bar.component';

@Component({
    'selector': 'state-template',
    'template': require('./first.template.html'),
    'directives': [
        ProgressBar
    ],
    'providers': [
        FileUploadService
    ]
})
export class FirstComponent {
    /**
     * @type FileUploadService
     */
    private fileUploadService: FileUploadService;

    /**
     * @type {string}
     */
    private redirectRoute: string = '/edit';

    /**
     * @type {Array}
     */
    private files: File[] = [];

    /**
     * @type {Router}
     */
    private router: Router;

    /**
     * Upload progress for files
     *
     * @type {number}
     */
    private uploadProgress: number = 0;

    /**
     * progress-bar Directive load condition
     *
     * @type {boolean}
     */
    private progressBarVisibility: boolean = false;

    /**
     * @type {string}
     */
    private uploadRoute: string = '/api/upload-file';

    constructor (
        @Inject(FileUploadService) fileUploadService: FileUploadService,
        @Inject(Router) router: Router
    ) {
        this.fileUploadService = fileUploadService;
        this.router = router;
    }

    public run (): void {}

    /**
     * @param fileInput
     */
    public filesSelectionHandler (fileInput: any){
        let FileList: FileList = fileInput.target.files;

        for (let i = 0, length = FileList.length; i < length; i++) {
            this.files.push(FileList.item(i));
        }

        this.progressBarVisibility = true;
    }

    public filesUploadHandler () {
        this.uploadProgress = 100;

        // just upload placeholder method
        this.fileUploadService
            .upload(this.uploadRoute)
            .subscribe(data => {
                console.log('Message from server:', data);
                this.router.navigate([this.redirectRoute]);
            });
    }
}