"use strict";
var core_1 = require('angular2/core');
var debugElement;
var predicate;
// #docregion scope_all
debugElement.query(predicate, core_1.Scope.all);
// #enddocregion
// #docregion scope_light
debugElement.query(predicate, core_1.Scope.light);
// #enddocregion
// #docregion scope_view
debugElement.query(predicate, core_1.Scope.view);
// #enddocregion
//# sourceMappingURL=debug_element.js.map