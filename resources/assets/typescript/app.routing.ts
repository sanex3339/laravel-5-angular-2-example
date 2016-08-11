import { Routes, RouterModule } from '@angular/router';
import { FirstComponent } from "./Components/FirstComponent/FirstComponent";
import { SecondComponent } from "./Components/SecondComponent/SecondComponent";

const routes: Routes = [
    {
        path: '',
        component: FirstComponent
    },
    {
        path: 'edit',
        component: SecondComponent
    }
];

export const routing = RouterModule.forRoot(routes);
