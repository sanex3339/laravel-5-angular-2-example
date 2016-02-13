///<reference path="../../../node_modules/angular2/typings/browser.d.ts"/>

import { AppComponent } from './app.component';
import { ROUTER_PROVIDERS } from "angular2/router";
import { bootstrap } from 'angular2/platform/browser';
import { enableProdMode } from "angular2/core";
import { UploadedTemplatesService } from "./Services/UploadedTemplatesService/UploadedTemplatesService";

//enableProdMode();
bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    UploadedTemplatesService
]);