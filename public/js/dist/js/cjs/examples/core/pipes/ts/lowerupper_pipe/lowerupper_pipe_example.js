"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var bootstrap_1 = require('angular2/bootstrap');
// #docregion LowerUpperPipe
var LowerUpperPipeExample = (function () {
    function LowerUpperPipeExample() {
    }
    LowerUpperPipeExample.prototype.change = function (value) { this.value = value; };
    LowerUpperPipeExample = __decorate([
        core_1.Component({
            selector: 'lowerupper-example',
            template: "<div>\n    <label>Name: </label><input #name (keyup)=\"change(name.value)\" type=\"text\">\n    <p>In lowercase: <pre>'{{value | lowercase}}'</pre></p>\n    <p>In uppercase: <pre>'{{value | uppercase}}'</pre></p>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], LowerUpperPipeExample);
    return LowerUpperPipeExample;
}());
exports.LowerUpperPipeExample = LowerUpperPipeExample;
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        core_1.Component({
            selector: 'example-app',
            directives: [LowerUpperPipeExample],
            template: "\n    <h1>LowercasePipe &amp; UppercasePipe Example</h1>\n    <lowerupper-example></lowerupper-example>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
}());
exports.AppCmp = AppCmp;
function main() {
    bootstrap_1.bootstrap(AppCmp);
}
exports.main = main;
//# sourceMappingURL=lowerupper_pipe_example.js.map