import { ViewMetadata } from '../metadata/view';
import { Type } from 'angular2/src/facade/lang';
/**
 * Resolves types to {@link ViewMetadata}.
 */
export declare class ViewResolver {
    /** @internal */
    _cache: Map<Type, ViewMetadata>;
    resolve(component: Type): ViewMetadata;
    /** @internal */
    _resolve(component: Type): ViewMetadata;
    /** @internal */
    _throwMixingViewAndComponent(propertyName: string, component: Type): void;
}
