import { AppComponent } from './app.component';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { ROUTER_PROVIDERS } from '@angular/router';
import { bootstrap }    from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

//enableProdMode();
bootstrap(<Function>AppComponent, [
    ROUTER_PROVIDERS,
    disableDeprecatedForms(),
    provideForms()
]);