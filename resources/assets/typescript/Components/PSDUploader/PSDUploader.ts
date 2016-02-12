import { Component, Inject, Injectable } from 'angular2/core';
import { FileUploadService } from '../../Services/FileUploadService/FileUploadService';
import { RedirectService } from '../../Services/RedirectService/RedirectService';
import { ProgressBar } from '../UI/ProgressBar/ProgressBar';
import { UploadedTemplate } from "../../Models/UploadedTemplate/UploadedTemplate";
import { UploadedTemplatesService } from "../../Services/UploadedTemplatesService/UploadedTemplatesService";

@Injectable()
@Component({
    'directives': [ProgressBar],
    'providers': [FileUploadService, RedirectService, UploadedTemplate],
    'selector': 'state-template',
    'templateUrl': '/templates/PSDTemplateUploadService.main'
})
export class PSDUploader {
    /**
     * @type FileUploadService
     */
    private fileUploadService: FileUploadService;

    /**
     * @type RedirectService
     */
    private redirectService: RedirectService;

    /**
     * @type {string}
     */
    private redirectRoute: string = '/EditTemplates';

    /**
     * @type {Array}
     */
    private psdTemplates: File[] = [];

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
     * @type UploadedTemplatesService
     */
    private uploadedTemplatesService: UploadedTemplatesService;

    /**
     * @type {string}
     */
    private uploadRoute: string = '/api/upload-file';

    constructor (
        @Inject(FileUploadService) fileUploadService: FileUploadService,
        @Inject(RedirectService) redirectService: RedirectService,
        uploadedTemplatesService: UploadedTemplatesService
    ) {
        this.fileUploadService = fileUploadService;
        this.redirectService = redirectService;
        this.uploadedTemplatesService = uploadedTemplatesService;
    }

    public run (): void {}

    /**
     * @param fileInput
     */
    public psdTemplateSelectionHandler (fileInput: any){
        let FileList: FileList = fileInput.target.files;

        for (let i = 0, length = FileList.length; i < length; i++) {
            this.psdTemplates.push(FileList.item(i));
        }

        this.progressBarVisibility = true;
    }

    public psdTemplateUploadHandler () {
        this.fileUploadService.progress$.subscribe(progress => {
            this.uploadProgress = progress;
        });

        this.fileUploadService.upload(this.uploadRoute, this.psdTemplates).then(
            (result) => {
                this.saveUploadedTemplatesData(result['files']);
                this.redirectService.redirect(this.redirectRoute)
            },
            (error) => {
                document.write(error);
            }
        );
    }

    /**
     * Save uploaded templates data into UploadedTemplatesService for
     * future use inside other components
     *
     * @param files
     */
    private saveUploadedTemplatesData (files: any[]): void {
        for (let file of files) {
            this.uploadedTemplatesService.addTemplate(
                new UploadedTemplate(file, false)
            );
        }
    }
}