import { bootstrap }    from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { ROUTER_PROVIDERS } from './app.routes';
import { enableProdMode } from '@angular/core';

//enableProdMode();
bootstrap(AppComponent, [
    ROUTER_PROVIDERS,
    disableDeprecatedForms(),
    provideForms()
])
.catch(err => console.error(err));