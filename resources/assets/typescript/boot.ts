import { AppComponent } from './app.component';
import { HashLocationStrategy, LocationStrategy, ROUTER_PROVIDERS } from "angular2/router";
import { bootstrap } from 'angular2/platform/browser';
import { enableProdMode, provide } from "angular2/core";
import { UploadedTemplatesService } from "./Services/UploadedTemplatesService/UploadedTemplatesService";

//enableProdMode();
bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}),
    UploadedTemplatesService
]);
