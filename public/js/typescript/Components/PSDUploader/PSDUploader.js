System.register(['angular2/core', '../../Services/FileUploadService/FileUploadService', '../../Services/RedirectService/RedirectService', '../UI/ProgressBar/ProgressBar', "../../Models/UploadedTemplate/UploadedTemplate", "../../Services/UploadedTemplatesService/UploadedTemplatesService"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var __param = (this && this.__param) || function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };
    var core_1, FileUploadService_1, RedirectService_1, ProgressBar_1, UploadedTemplate_1, UploadedTemplatesService_1;
    var PSDUploader;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (FileUploadService_1_1) {
                FileUploadService_1 = FileUploadService_1_1;
            },
            function (RedirectService_1_1) {
                RedirectService_1 = RedirectService_1_1;
            },
            function (ProgressBar_1_1) {
                ProgressBar_1 = ProgressBar_1_1;
            },
            function (UploadedTemplate_1_1) {
                UploadedTemplate_1 = UploadedTemplate_1_1;
            },
            function (UploadedTemplatesService_1_1) {
                UploadedTemplatesService_1 = UploadedTemplatesService_1_1;
            }],
        execute: function() {
            PSDUploader = (function () {
                function PSDUploader(fileUploadService, redirectService, uploadedTemplatesService) {
                    /**
                     * @type {Array}
                     */
                    this.psdTemplates = [];
                    /**
                     * Upload progress for files
                     *
                     * @type {number}
                     */
                    this.uploadProgress = 0;
                    /**
                     * ProgressBar Directive load condition
                     *
                     * @type {boolean}
                     */
                    this.progressBarVisibility = false;
                    this.fileUploadService = fileUploadService;
                    this.redirectService = redirectService;
                    this.uploadedTemplatesService = uploadedTemplatesService;
                }
                PSDUploader.prototype.run = function () { };
                /**
                 * @param fileInput
                 */
                PSDUploader.prototype.psdTemplateSelectionHandler = function (fileInput) {
                    var FileList = fileInput.target.files;
                    for (var i = 0, length_1 = FileList.length; i < length_1; i++) {
                        this.psdTemplates.push(FileList.item(i));
                    }
                    this.progressBarVisibility = true;
                };
                PSDUploader.prototype.psdTemplateUploadHandler = function () {
                    var _this = this;
                    this.fileUploadService.progress$.subscribe(function (progress) {
                        _this.uploadProgress = progress;
                    });
                    this.fileUploadService.upload('/api/upload-file', this.psdTemplates).then(function (result) {
                        _this.saveUploadedTemplatesData(result['files']);
                        _this.redirectService.redirect('/Test', 800);
                    }, function (error) {
                        document.write(error);
                    });
                };
                /**
                 * Save uploaded templates data into UploadedTemplatesService for
                 * future use inside other components
                 *
                 * @param files
                 */
                PSDUploader.prototype.saveUploadedTemplatesData = function (files) {
                    for (var _i = 0; _i < files.length; _i++) {
                        var file = files[_i];
                        this.uploadedTemplatesService.addTemplate(new UploadedTemplate_1.UploadedTemplate(file, false));
                    }
                };
                PSDUploader = __decorate([
                    core_1.Injectable(),
                    core_1.Component({
                        'directives': [ProgressBar_1.ProgressBar],
                        'providers': [FileUploadService_1.FileUploadService, RedirectService_1.RedirectService, UploadedTemplate_1.UploadedTemplate],
                        'selector': 'state-template',
                        'templateUrl': '/templates/PSDTemplateUploadService.main'
                    }),
                    __param(0, core_1.Inject(FileUploadService_1.FileUploadService)),
                    __param(1, core_1.Inject(RedirectService_1.RedirectService)), 
                    __metadata('design:paramtypes', [FileUploadService_1.FileUploadService, RedirectService_1.RedirectService, UploadedTemplatesService_1.UploadedTemplatesService])
                ], PSDUploader);
                return PSDUploader;
            })();
            exports_1("PSDUploader", PSDUploader);
        }
    }
});
