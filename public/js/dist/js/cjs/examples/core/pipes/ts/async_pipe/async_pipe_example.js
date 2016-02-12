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
var Observable_1 = require('rxjs/Observable');
// #docregion AsyncPipe
var AsyncPipeExample = (function () {
    function AsyncPipeExample() {
        this.greeting = null;
        this.arrived = false;
        this.resolve = null;
        this.reset();
    }
    AsyncPipeExample.prototype.reset = function () {
        var _this = this;
        this.arrived = false;
        this.greeting = new Promise(function (resolve, reject) { _this.resolve = resolve; });
    };
    AsyncPipeExample.prototype.clicked = function () {
        if (this.arrived) {
            this.reset();
        }
        else {
            this.resolve("hi there!");
            this.arrived = true;
        }
    };
    AsyncPipeExample = __decorate([
        core_1.Component({
            selector: 'async-example',
            template: "<div>\n    <p>Wait for it... {{ greeting | async }}</p>\n    <button (click)=\"clicked()\">{{ arrived ? 'Reset' : 'Resolve' }}</button>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], AsyncPipeExample);
    return AsyncPipeExample;
}());
exports.AsyncPipeExample = AsyncPipeExample;
// #enddocregion
// #docregion AsyncPipeObservable
var Task = (function () {
    function Task() {
        this.time = new Observable_1.Observable(function (observer) { setInterval(function (_) { return observer.next(new Date().getTime()); }, 500); });
    }
    Task = __decorate([
        core_1.Component({ selector: "task-cmp", template: "Time: {{ time | async }}" }), 
        __metadata('design:paramtypes', [])
    ], Task);
    return Task;
}());
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        core_1.Component({
            selector: 'example-app',
            directives: [AsyncPipeExample],
            template: "\n    <h1>AsyncPipe Example</h1>\n    <async-example></async-example>\n  "
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
//# sourceMappingURL=async_pipe_example.js.map