import { Promise } from 'angular2/src/facade/async';
import { Type } from 'angular2/src/facade/lang';
import { RouteHandler } from './route_handler';
import { RouteData } from './instruction';
export declare class AsyncRouteHandler implements RouteHandler {
    private _loader;
    /** @internal */
    _resolvedComponent: Promise<any>;
    componentType: Type;
    data: RouteData;
    constructor(_loader: Function, data?: {
        [key: string]: any;
    });
    resolveComponentType(): Promise<any>;
}
