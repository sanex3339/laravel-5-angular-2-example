"use strict";
var bootstrap_1 = require('angular2/bootstrap');
var common_1 = require('angular2/common');
var core_1 = require('angular2/core');
var MyApp = null;
var myValidator = null;
// #docregion ng_validators
bootstrap_1.bootstrap(MyApp, [new core_1.Provider(common_1.NG_VALIDATORS, { useValue: myValidator, multi: true })]);
// #enddocregion
//# sourceMappingURL=ng_validators.js.map