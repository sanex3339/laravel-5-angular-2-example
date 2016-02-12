System.register(['angular2/core', 'angular2/router'], function(exports_1) {
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
    var core_1, router_1;
    var RedirectService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            }],
        execute: function() {
            RedirectService = (function () {
                function RedirectService(router) {
                    this.router = router;
                }
                /**
                 * Redirect on given link route with given data
                 *
                 * @param link
                 * @param data
                 * @param delay
                 * @returns {Promise<T>}
                 */
                RedirectService.prototype.redirect = function (link, data, delay) {
                    var _this = this;
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            _this.router.navigate([link]);
                            resolve(data);
                        }, delay);
                    });
                };
                RedirectService = __decorate([
                    core_1.Injectable(),
                    __param(0, core_1.Inject(router_1.Router)), 
                    __metadata('design:paramtypes', [router_1.Router])
                ], RedirectService);
                return RedirectService;
            })();
            exports_1("RedirectService", RedirectService);
        }
    }
});
