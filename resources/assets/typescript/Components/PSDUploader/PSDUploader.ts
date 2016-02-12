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

        this.fileUploadService.upload('/api/upload-file', this.psdTemplates).then(
            (result) => {
                this.uploadedTemplatesService.addTemplate(new UploadedTemplate('test_image_1', false));
                this.uploadedTemplatesService.addTemplate(new UploadedTemplate('test_image_2', false));
                this.redirectService.redirect('/Test', result, 800)
            },
            (error) => {
                document.write(error);
            }
        );
    }
}