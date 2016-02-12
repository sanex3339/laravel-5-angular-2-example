"use strict";
// #docregion Observable
var Observable_1 = require('rxjs/Observable');
var obs = new Observable_1.Observable(function (obs) {
    var i = 0;
    setInterval(function (_) { obs.next(++i); }, 1000);
});
obs.subscribe(function (i) { return console.log(i + " seconds elapsed"); });
// #enddocregion
//# sourceMappingURL=observable.js.map