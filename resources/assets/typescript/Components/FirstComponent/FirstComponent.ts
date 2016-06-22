import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FileUploadService } from '../../Services/FileUploadService/FileUploadService';
import { ProgressBar } from '../UI/ProgressBar/ProgressBar';

@Component({
    'selector': 'state-template',
    'templateUrl': '/templates/FirstComponent.main',
    'directives': [ProgressBar],
    'providers': [FileUploadService]
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
     * ProgressBar Directive load condition
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
        this.fileUploadService.upload().then(
            () => {
                this.router.navigate([this.redirectRoute]);
            },
            (error) => {
                document.write(error);
            }
        );
    }
}