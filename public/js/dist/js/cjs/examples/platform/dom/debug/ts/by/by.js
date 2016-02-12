"use strict";
var browser_1 = require('angular2/platform/browser');
var core_1 = require('angular2/core');
var debugElement;
var MyDirective = (function () {
    function MyDirective() {
    }
    return MyDirective;
}());
// #docregion by_all
debugElement.query(browser_1.By.all(), core_1.Scope.all);
// #enddocregion
// #docregion by_css
debugElement.query(browser_1.By.css('[attribute]'), core_1.Scope.all);
// #enddocregion
// #docregion by_directive
debugElement.query(browser_1.By.directive(MyDirective), core_1.Scope.all);
// #enddocregion
//# sourceMappingURL=by.js.map