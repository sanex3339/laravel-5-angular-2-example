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
var common_1 = require('angular2/common');
// #docregion min
var MinLengthTestComponent = (function () {
    function MinLengthTestComponent() {
    }
    MinLengthTestComponent = __decorate([
        core_1.Component({
            selector: 'min-cmp',
            directives: [common_1.MinLengthValidator],
            template: "\n<form>\n  <p>Year: <input ngControl=\"year\" minlength=\"2\"></p>\n</form>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], MinLengthTestComponent);
    return MinLengthTestComponent;
}());
// #enddocregion
// #docregion max
var MaxLengthTestComponent = (function () {
    function MaxLengthTestComponent() {
    }
    MaxLengthTestComponent = __decorate([
        core_1.Component({
            selector: 'max-cmp',
            directives: [common_1.MaxLengthValidator],
            template: "\n<form>\n  <p>Year: <input ngControl=\"year\" maxlength=\"4\"></p>\n</form>\n"
        }), 
        __metadata('design:paramtypes', [])
    ], MaxLengthTestComponent);
    return MaxLengthTestComponent;
}());
// #enddocregion
//# sourceMappingURL=validators.js.map