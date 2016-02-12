import { Injector, ResolvedProvider } from 'angular2/src/core/di';
import * as eli from './element_injector';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import { Renderer, RenderViewWithFragments } from 'angular2/src/core/render/api';
import { Locals } from 'angular2/src/core/change_detection/change_detection';
export declare class AppViewManagerUtils {
    constructor();
    getComponentInstance(parentView: viewModule.AppView, boundElementIndex: number): any;
    createView(mergedParentViewProto: viewModule.AppProtoView, renderViewWithFragments: RenderViewWithFragments, viewManager: avmModule.AppViewManager, renderer: Renderer): viewModule.AppView;
    hydrateRootHostView(hostView: viewModule.AppView, injector: Injector): void;
    attachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, contextView: viewModule.AppView, contextBoundElementIndex: number, index: number, view: viewModule.AppView): void;
    detachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, index: number): void;
    hydrateViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, contextView: viewModule.AppView, contextBoundElementIndex: number, index: number, imperativelyCreatedProviders: ResolvedProvider[]): void;
    /** @internal */
    _hydrateView(initView: viewModule.AppView, imperativelyCreatedInjector: Injector, hostElementInjector: eli.ElementInjector, context: Object, parentLocals: Locals): void;
    /** @internal */
    _populateViewLocals(view: viewModule.AppView, elementInjector: eli.ElementInjector, boundElementIdx: number): void;
    /** @internal */
    _setUpEventEmitters(view: viewModule.AppView, elementInjector: eli.ElementInjector, boundElementIndex: number): void;
    dehydrateView(initView: viewModule.AppView): void;
}
