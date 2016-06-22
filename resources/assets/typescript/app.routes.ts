import { provideRouter, RouterConfig } from '@angular/router';
import { FirstComponent } from "./Components/FirstComponent/FirstComponent";
import { SecondComponent } from "./Components/SecondComponent/SecondComponent";

export const routes: RouterConfig = [
    {
        path: '',
        component: FirstComponent
    },
    {
        path: 'edit',
        component: SecondComponent
    }
];

export const ROUTER_PROVIDERS = [
    provideRouter(routes)
];