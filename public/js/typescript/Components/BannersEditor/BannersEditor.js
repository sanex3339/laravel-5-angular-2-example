System.register(['angular2/core', "../../Services/UploadedTemplatesService/UploadedTemplatesService"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, UploadedTemplatesService_1;
    var BannersEditor;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (UploadedTemplatesService_1_1) {
                UploadedTemplatesService_1 = UploadedTemplatesService_1_1;
            }],
        execute: function() {
            BannersEditor = (function () {
                function BannersEditor(uploadedTemplatesService) {
                    this.uploadedTemplatesService = uploadedTemplatesService;
                    console.log(this.uploadedTemplatesService.getUploadedTemplates());
                }
                BannersEditor = __decorate([
                    core_1.Injectable(),
                    core_1.Component({
                        'selector': 'state-template',
                        'template': 'test'
                    }), 
                    __metadata('design:paramtypes', [UploadedTemplatesService_1.UploadedTemplatesService])
                ], BannersEditor);
                return BannersEditor;
            })();
            exports_1("BannersEditor", BannersEditor);
        }
    }
});
