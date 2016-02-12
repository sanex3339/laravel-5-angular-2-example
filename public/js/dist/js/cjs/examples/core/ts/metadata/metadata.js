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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('angular2/core');
var CustomDirective;
// #docregion component
var Greet = (function () {
    function Greet() {
        this.name = 'World';
    }
    Greet = __decorate([
        core_1.Component({ selector: 'greet', template: 'Hello {{name}}!', directives: [CustomDirective] }), 
        __metadata('design:paramtypes', [])
    ], Greet);
    return Greet;
}());
// #enddocregion
// #docregion attributeFactory
var Page = (function () {
    function Page(title) {
        this.title = title;
    }
    Page = __decorate([
        core_1.Component({ selector: 'page', template: 'Title: {{title}}' }),
        __param(0, core_1.Attribute('title')), 
        __metadata('design:paramtypes', [String])
    ], Page);
    return Page;
}());
// #enddocregion
// #docregion attributeMetadata
var InputAttrDirective = (function () {
    function InputAttrDirective(type) {
        // type would be 'text' in this example
    }
    InputAttrDirective = __decorate([
        core_1.Directive({ selector: 'input' }),
        __param(0, core_1.Attribute('type')), 
        __metadata('design:paramtypes', [Object])
    ], InputAttrDirective);
    return InputAttrDirective;
}());
// #enddocregion
// #docregion directive
var InputDirective = (function () {
    function InputDirective() {
        // Add some logic.
    }
    InputDirective = __decorate([
        core_1.Directive({ selector: 'input' }), 
        __metadata('design:paramtypes', [])
    ], InputDirective);
    return InputDirective;
}());
// #enddocregion
// #docregion pipe
var Lowercase = (function () {
    function Lowercase() {
    }
    Lowercase.prototype.transform = function (v, args) { return v.toLowerCase(); };
    Lowercase = __decorate([
        core_1.Pipe({ name: 'lowercase' }), 
        __metadata('design:paramtypes', [])
    ], Lowercase);
    return Lowercase;
}());
// #enddocregion
//# sourceMappingURL=metadata.js.map