"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var core_1 = require('angular2/core');
var bootstrap_1 = require('angular2/bootstrap');
var compiler_1 = require('angular2/compiler');
var MyApp;
// #docregion url_resolver
var MyUrlResolver = (function (_super) {
    __extends(MyUrlResolver, _super);
    function MyUrlResolver() {
        _super.apply(this, arguments);
    }
    MyUrlResolver.prototype.resolve = function (baseUrl, url) {
        // Serve CSS files from a special CDN.
        if (url.substr(-4) === '.css') {
            return _super.prototype.resolve.call(this, 'http://cdn.myapp.com/css/', url);
        }
        return _super.prototype.resolve.call(this, baseUrl, url);
    };
    return MyUrlResolver;
}(compiler_1.UrlResolver));
bootstrap_1.bootstrap(MyApp, [core_1.provide(compiler_1.UrlResolver, { useClass: MyUrlResolver })]);
// #enddocregion
//# sourceMappingURL=url_resolver.js.map