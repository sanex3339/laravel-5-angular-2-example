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
var router_1 = require('angular2/router');
// #docregion routerCanDeactivate
var NoteCmp = (function () {
    function NoteCmp(params) {
        this.id = params.get('id');
    }
    NoteCmp.prototype.routerCanDeactivate = function (next, prev) {
        return confirm('Are you sure you want to leave?');
    };
    NoteCmp = __decorate([
        core_1.Component({
            selector: 'note-cmp',
            template: "\n    <div>\n      <h2>id: {{id}}</h2>\n      <textarea cols=\"40\" rows=\"10\"></textarea>\n    </div>"
        }), 
        __metadata('design:paramtypes', [router_1.RouteParams])
    ], NoteCmp);
    return NoteCmp;
}());
// #enddocregion
var NoteIndexCmp = (function () {
    function NoteIndexCmp() {
    }
    NoteIndexCmp = __decorate([
        core_1.Component({
            selector: 'note-index-cmp',
            template: "\n    <h1>Your Notes</h1>\n    <div>\n      Edit <a [routerLink]=\"['/NoteCmp', {id: 1}]\" id=\"note-1-link\">Note 1</a> |\n      Edit <a [routerLink]=\"['/NoteCmp', {id: 2}]\" id=\"note-2-link\">Note 2</a>\n    </div>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES]
        }), 
        __metadata('design:paramtypes', [])
    ], NoteIndexCmp);
    return NoteIndexCmp;
}());
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        core_1.Component({
            selector: 'example-app',
            template: "\n    <h1>My App</h1>\n    <router-outlet></router-outlet>\n  ",
            directives: [router_1.ROUTER_DIRECTIVES]
        }),
        router_1.RouteConfig([
            { path: '/note/:id', component: NoteCmp, name: 'NoteCmp' },
            { path: '/', component: NoteIndexCmp, name: 'NoteIndexCmp' }
        ]), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
}());
function main() {
    return bootstrap_1.bootstrap(AppCmp, [core_1.provide(router_1.APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/can_deactivate' })]);
}
exports.main = main;
//# sourceMappingURL=can_deactivate_example.js.map