System.register(['angular2/core', '../../Models/UploadedTemplate/UploadedTemplate'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, UploadedTemplate_1;
    var UploadedTemplatesService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (UploadedTemplate_1_1) {
                UploadedTemplate_1 = UploadedTemplate_1_1;
            }],
        execute: function() {
            UploadedTemplatesService = (function () {
                function UploadedTemplatesService() {
                    this.uploadedTemplates = [];
                }
                UploadedTemplatesService.prototype.addTemplate = function (template) {
                    this.uploadedTemplates.push(template);
                };
                UploadedTemplatesService.prototype.getUploadedTemplates = function () {
                    return this.uploadedTemplates;
                };
                UploadedTemplatesService = __decorate([
                    core_1.Injectable(),
                    core_1.Component({
                        'providers': [UploadedTemplate_1.UploadedTemplate]
                    }), 
                    __metadata('design:paramtypes', [])
                ], UploadedTemplatesService);
                return UploadedTemplatesService;
            })();
            exports_1("UploadedTemplatesService", UploadedTemplatesService);
        }
    }
});
