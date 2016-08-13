import { Routes, RouterModule } from '@angular/router';
import { FirstComponent } from "./components/first/first.component";
import { SecondComponent } from "./components/second/second.component";

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
