import { Component, Inject, Injectable } from 'angular2/core';
import { UploadedTemplatesService } from "../../Services/UploadedTemplatesService/UploadedTemplatesService";

@Injectable()
@Component({
    'selector': 'state-template',
    'templateUrl': '/templates/BannersEditor.main'
})
export class BannersEditor {
    /**
     * @type string[]
     */
    templateNames: string[];

    uploadedTemplatesService: UploadedTemplatesService;

    constructor (uploadedTemplatesService: UploadedTemplatesService) {
        this.uploadedTemplatesService = uploadedTemplatesService;

        console.log('BannersEditor was loaded');
        console.log(this.uploadedTemplatesService.getUploadedTemplates());
    }
}