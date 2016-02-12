import { Component, Injectable } from 'angular2/core';
import { UploadedTemplate } from '../../Models/UploadedTemplate/UploadedTemplate';

@Injectable()
@Component({
    'providers': [UploadedTemplate]
})
export class UploadedTemplatesService {
    private uploadedTemplates: UploadedTemplate[];

    constructor (uploadedTemplates: UploadedTemplate[]) {
        this.uploadedTemplates = uploadedTemplates;
    }

    public addTemplate (template: UploadedTemplate): void {
        this.uploadedTemplates.push(template);
    }

    public getUploadedTemplates (): UploadedTemplate[] {
        return this.uploadedTemplates;
    }
}