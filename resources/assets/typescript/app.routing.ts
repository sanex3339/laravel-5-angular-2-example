import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from "./components/page-not-found/page-not-found.component";
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
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

export const routing = RouterModule.forRoot(routes);
