System.register(['./app.component', "angular2/router", 'angular2/platform/browser', "angular2/core", "./Services/UploadedTemplatesService/UploadedTemplatesService"], function(exports_1) {
    var app_component_1, router_1, browser_1, core_1, UploadedTemplatesService_1;
    return {
        setters:[
            function (app_component_1_1) {
                app_component_1 = app_component_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (UploadedTemplatesService_1_1) {
                UploadedTemplatesService_1 = UploadedTemplatesService_1_1;
            }],
        execute: function() {
            //enableProdMode();
            browser_1.bootstrap(app_component_1.AppComponent, [
                router_1.ROUTER_PROVIDERS,
                core_1.provide(router_1.APP_BASE_HREF, { useValue: '/' }),
                UploadedTemplatesService_1.UploadedTemplatesService
            ]);
        }
    }
});
