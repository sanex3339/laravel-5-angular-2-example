import { Component, Injectable } from 'angular2/core';

@Injectable()
export class UploadedTemplate {
    private logo: boolean;
    private templateName: string;

    constructor (templateName: string, logo: boolean) {
        this.templateName = templateName;
        this.logo = logo;
    }

    public hasLogo (): boolean {
        return this.logo;
    }

    public getTemplateName (): string {
        return this.templateName;
    }
}