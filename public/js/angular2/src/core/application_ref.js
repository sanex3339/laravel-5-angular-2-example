'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ng_zone_1 = require('angular2/src/core/zone/ng_zone');
var lang_1 = require('angular2/src/facade/lang');
var di_1 = require('angular2/src/core/di');
var application_tokens_1 = require('./application_tokens');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var testability_1 = require('angular2/src/core/testability/testability');
var dynamic_component_loader_1 = require('angular2/src/core/linker/dynamic_component_loader');
var exceptions_1 = require('angular2/src/facade/exceptions');
var console_1 = require('angular2/src/core/console');
var profile_1 = require('./profile/profile');
var lang_2 = require('angular2/src/facade/lang');
/**
 * Construct providers specific to an individual root component.
 */
function _componentProviders(appComponentType) {
    return [
        di_1.provide(application_tokens_1.APP_COMPONENT, { useValue: appComponentType }),
        di_1.provide(application_tokens_1.APP_COMPONENT_REF_PROMISE, {
            useFactory: function (dynamicComponentLoader, appRef, injector) {
                // Save the ComponentRef for disposal later.
                var ref;
                // TODO(rado): investigate whether to support providers on root component.
                return dynamicComponentLoader.loadAsRoot(appComponentType, null, injector, function () { appRef._unloadComponent(ref); })
                    .then(function (componentRef) {
                    ref = componentRef;
                    var testability = injector.getOptional(testability_1.Testability);
                    if (lang_1.isPresent(testability)) {
                        injector.get(testability_1.TestabilityRegistry)
                            .registerApplication(componentRef.location.nativeElement, testability);
                    }
                    return componentRef;
                });
            },
            deps: [dynamic_component_loader_1.DynamicComponentLoader, ApplicationRef, di_1.Injector]
        }),
        di_1.provide(appComponentType, {
            useFactory: function (p) { return p.then(function (ref) { return ref.instance; }); },
            deps: [application_tokens_1.APP_COMPONENT_REF_PROMISE]
        }),
    ];
}
/**
 * Create an Angular zone.
 */
function createNgZone() {
    return new ng_zone_1.NgZone({ enableLongStackTrace: lang_1.assertionsEnabled() });
}
exports.createNgZone = createNgZone;
var _platform;
var _platformProviders;
/**
 * Initialize the Angular 'platform' on the page.
 *
 * See {@link PlatformRef} for details on the Angular platform.
 *
 * It is also possible to specify providers to be made in the new platform. These providers
 * will be shared between all applications on the page. For example, an abstraction for
 * the browser cookie jar should be bound at the platform level, because there is only one
 * cookie jar regardless of how many applications on the page will be accessing it.
 *
 * The platform function can be called multiple times as long as the same list of providers
 * is passed into each call. If the platform function is called with a different set of
 * provides, Angular will throw an exception.
 */
function platform(providers) {
    lang_2.lockMode();
    if (lang_1.isPresent(_platform)) {
        if (collection_1.ListWrapper.equals(_platformProviders, providers)) {
            return _platform;
        }
        else {
            throw new exceptions_1.BaseException("platform cannot be initialized with different sets of providers.");
        }
    }
    else {
        return _createPlatform(providers);
    }
}
exports.platform = platform;
/**
 * Dispose the existing platform.
 */
function disposePlatform() {
    if (lang_1.isPresent(_platform)) {
        _platform.dispose();
        _platform = null;
    }
}
exports.disposePlatform = disposePlatform;
function _createPlatform(providers) {
    _platformProviders = providers;
    var injector = di_1.Injector.resolveAndCreate(providers);
    _platform = new PlatformRef_(injector, function () {
        _platform = null;
        _platformProviders = null;
    });
    _runPlatformInitializers(injector);
    return _platform;
}
function _runPlatformInitializers(injector) {
    var inits = injector.getOptional(application_tokens_1.PLATFORM_INITIALIZER);
    if (lang_1.isPresent(inits))
        inits.forEach(function (init) { return init(); });
}
/**
 * The Angular platform is the entry point for Angular on a web page. Each page
 * has exactly one platform, and services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 *
 * A page's platform is initialized implicitly when {@link bootstrap}() is called, or
 * explicitly by calling {@link platform}().
 */
var PlatformRef = (function () {
    function PlatformRef() {
    }
    Object.defineProperty(PlatformRef.prototype, "injector", {
        /**
         * Retrieve the platform {@link Injector}, which is the parent injector for
         * every Angular application on the page and provides singleton providers.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return PlatformRef;
})();
exports.PlatformRef = PlatformRef;
var PlatformRef_ = (function (_super) {
    __extends(PlatformRef_, _super);
    function PlatformRef_(_injector, _dispose) {
        _super.call(this);
        this._injector = _injector;
        this._dispose = _dispose;
        /** @internal */
        this._applications = [];
        /** @internal */
        this._disposeListeners = [];
    }
    PlatformRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    Object.defineProperty(PlatformRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    PlatformRef_.prototype.application = function (providers) {
        var app = this._initApp(createNgZone(), providers);
        if (async_1.PromiseWrapper.isPromise(app)) {
            throw new exceptions_1.BaseException("Cannot use asyncronous app initializers with application. Use asyncApplication instead.");
        }
        return app;
    };
    PlatformRef_.prototype.asyncApplication = function (bindingFn, additionalProviders) {
        var _this = this;
        var zone = createNgZone();
        var completer = async_1.PromiseWrapper.completer();
        if (bindingFn === null) {
            completer.resolve(this._initApp(zone, additionalProviders));
        }
        else {
            zone.run(function () {
                async_1.PromiseWrapper.then(bindingFn(zone), function (providers) {
                    if (lang_1.isPresent(additionalProviders)) {
                        providers = collection_1.ListWrapper.concat(providers, additionalProviders);
                    }
                    var promise = _this._initApp(zone, providers);
                    completer.resolve(promise);
                });
            });
        }
        return completer.promise;
    };
    PlatformRef_.prototype._initApp = function (zone, providers) {
        var _this = this;
        var injector;
        var app;
        zone.run(function () {
            providers = collection_1.ListWrapper.concat(providers, [
                di_1.provide(ng_zone_1.NgZone, { useValue: zone }),
                di_1.provide(ApplicationRef, { useFactory: function () { return app; }, deps: [] })
            ]);
            var exceptionHandler;
            try {
                injector = _this.injector.resolveAndCreateChild(providers);
                exceptionHandler = injector.get(exceptions_1.ExceptionHandler);
                zone.overrideOnErrorHandler(function (e, s) { return exceptionHandler.call(e, s); });
            }
            catch (e) {
                if (lang_1.isPresent(exceptionHandler)) {
                    exceptionHandler.call(e, e.stack);
                }
                else {
                    lang_1.print(e.toString());
                }
            }
        });
        app = new ApplicationRef_(this, zone, injector);
        this._applications.push(app);
        var promise = _runAppInitializers(injector);
        if (promise !== null) {
            return async_1.PromiseWrapper.then(promise, function (_) { return app; });
        }
        else {
            return app;
        }
    };
    PlatformRef_.prototype.dispose = function () {
        collection_1.ListWrapper.clone(this._applications).forEach(function (app) { return app.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._dispose();
    };
    /** @internal */
    PlatformRef_.prototype._applicationDisposed = function (app) { collection_1.ListWrapper.remove(this._applications, app); };
    return PlatformRef_;
})(PlatformRef);
exports.PlatformRef_ = PlatformRef_;
function _runAppInitializers(injector) {
    var inits = injector.getOptional(application_tokens_1.APP_INITIALIZER);
    var promises = [];
    if (lang_1.isPresent(inits)) {
        inits.forEach(function (init) {
            var retVal = init();
            if (async_1.PromiseWrapper.isPromise(retVal)) {
                promises.push(retVal);
            }
        });
    }
    if (promises.length > 0) {
        return async_1.PromiseWrapper.all(promises);
    }
    else {
        return null;
    }
}
/**
 * A reference to an Angular application running on a page.
 *
 * For more about Angular applications, see the documentation for {@link bootstrap}.
 */
var ApplicationRef = (function () {
    function ApplicationRef() {
    }
    Object.defineProperty(ApplicationRef.prototype, "injector", {
        /**
         * Retrieve the application {@link Injector}.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ApplicationRef.prototype, "zone", {
        /**
         * Retrieve the application {@link NgZone}.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ApplicationRef.prototype, "componentTypes", {
        /**
         * Get a list of component types registered to this application.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ApplicationRef;
})();
exports.ApplicationRef = ApplicationRef;
var ApplicationRef_ = (function (_super) {
    __extends(ApplicationRef_, _super);
    function ApplicationRef_(_platform, _zone, _injector) {
        var _this = this;
        _super.call(this);
        this._platform = _platform;
        this._zone = _zone;
        this._injector = _injector;
        /** @internal */
        this._bootstrapListeners = [];
        /** @internal */
        this._disposeListeners = [];
        /** @internal */
        this._rootComponents = [];
        /** @internal */
        this._rootComponentTypes = [];
        /** @internal */
        this._changeDetectorRefs = [];
        /** @internal */
        this._runningTick = false;
        /** @internal */
        this._enforceNoNewChanges = false;
        if (lang_1.isPresent(this._zone)) {
            async_1.ObservableWrapper.subscribe(this._zone.onTurnDone, function (_) { _this._zone.run(function () { _this.tick(); }); });
        }
        this._enforceNoNewChanges = lang_1.assertionsEnabled();
    }
    ApplicationRef_.prototype.registerBootstrapListener = function (listener) {
        this._bootstrapListeners.push(listener);
    };
    ApplicationRef_.prototype.registerDisposeListener = function (dispose) { this._disposeListeners.push(dispose); };
    ApplicationRef_.prototype.registerChangeDetector = function (changeDetector) {
        this._changeDetectorRefs.push(changeDetector);
    };
    ApplicationRef_.prototype.unregisterChangeDetector = function (changeDetector) {
        collection_1.ListWrapper.remove(this._changeDetectorRefs, changeDetector);
    };
    ApplicationRef_.prototype.bootstrap = function (componentType, providers) {
        var _this = this;
        var completer = async_1.PromiseWrapper.completer();
        this._zone.run(function () {
            var componentProviders = _componentProviders(componentType);
            if (lang_1.isPresent(providers)) {
                componentProviders.push(providers);
            }
            var exceptionHandler = _this._injector.get(exceptions_1.ExceptionHandler);
            _this._rootComponentTypes.push(componentType);
            try {
                var injector = _this._injector.resolveAndCreateChild(componentProviders);
                var compRefToken = injector.get(application_tokens_1.APP_COMPONENT_REF_PROMISE);
                var tick = function (componentRef) {
                    _this._loadComponent(componentRef);
                    completer.resolve(componentRef);
                };
                var tickResult = async_1.PromiseWrapper.then(compRefToken, tick);
                // THIS MUST ONLY RUN IN DART.
                // This is required to report an error when no components with a matching selector found.
                // Otherwise the promise will never be completed.
                // Doing this in JS causes an extra error message to appear.
                if (lang_1.IS_DART) {
                    async_1.PromiseWrapper.then(tickResult, function (_) { });
                }
                async_1.PromiseWrapper.then(tickResult, null, function (err, stackTrace) { return completer.reject(err, stackTrace); });
            }
            catch (e) {
                exceptionHandler.call(e, e.stack);
                completer.reject(e, e.stack);
            }
        });
        return completer.promise.then(function (_) {
            var c = _this._injector.get(console_1.Console);
            if (lang_1.assertionsEnabled()) {
                c.log("Angular 2 is running in the development mode. Call enableProdMode() to enable the production mode.");
            }
            return _;
        });
    };
    /** @internal */
    ApplicationRef_.prototype._loadComponent = function (ref) {
        var appChangeDetector = ref.location.internalElement.parentView.changeDetector;
        this._changeDetectorRefs.push(appChangeDetector.ref);
        this.tick();
        this._rootComponents.push(ref);
        this._bootstrapListeners.forEach(function (listener) { return listener(ref); });
    };
    /** @internal */
    ApplicationRef_.prototype._unloadComponent = function (ref) {
        if (!collection_1.ListWrapper.contains(this._rootComponents, ref)) {
            return;
        }
        this.unregisterChangeDetector(ref.location.internalElement.parentView.changeDetector.ref);
        collection_1.ListWrapper.remove(this._rootComponents, ref);
    };
    Object.defineProperty(ApplicationRef_.prototype, "injector", {
        get: function () { return this._injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApplicationRef_.prototype, "zone", {
        get: function () { return this._zone; },
        enumerable: true,
        configurable: true
    });
    ApplicationRef_.prototype.tick = function () {
        if (this._runningTick) {
            throw new exceptions_1.BaseException("ApplicationRef.tick is called recursively");
        }
        var s = ApplicationRef_._tickScope();
        try {
            this._runningTick = true;
            this._changeDetectorRefs.forEach(function (detector) { return detector.detectChanges(); });
            if (this._enforceNoNewChanges) {
                this._changeDetectorRefs.forEach(function (detector) { return detector.checkNoChanges(); });
            }
        }
        finally {
            this._runningTick = false;
            profile_1.wtfLeave(s);
        }
    };
    ApplicationRef_.prototype.dispose = function () {
        // TODO(alxhub): Dispose of the NgZone.
        collection_1.ListWrapper.clone(this._rootComponents).forEach(function (ref) { return ref.dispose(); });
        this._disposeListeners.forEach(function (dispose) { return dispose(); });
        this._platform._applicationDisposed(this);
    };
    Object.defineProperty(ApplicationRef_.prototype, "componentTypes", {
        get: function () { return this._rootComponentTypes; },
        enumerable: true,
        configurable: true
    });
    /** @internal */
    ApplicationRef_._tickScope = profile_1.wtfCreateScope('ApplicationRef#tick()');
    return ApplicationRef_;
})(ApplicationRef);
exports.ApplicationRef_ = ApplicationRef_;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwbGljYXRpb25fcmVmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmLnRzIl0sIm5hbWVzIjpbIl9jb21wb25lbnRQcm92aWRlcnMiLCJjcmVhdGVOZ1pvbmUiLCJwbGF0Zm9ybSIsImRpc3Bvc2VQbGF0Zm9ybSIsIl9jcmVhdGVQbGF0Zm9ybSIsIl9ydW5QbGF0Zm9ybUluaXRpYWxpemVycyIsIlBsYXRmb3JtUmVmIiwiUGxhdGZvcm1SZWYuY29uc3RydWN0b3IiLCJQbGF0Zm9ybVJlZi5pbmplY3RvciIsIlBsYXRmb3JtUmVmXyIsIlBsYXRmb3JtUmVmXy5jb25zdHJ1Y3RvciIsIlBsYXRmb3JtUmVmXy5yZWdpc3RlckRpc3Bvc2VMaXN0ZW5lciIsIlBsYXRmb3JtUmVmXy5pbmplY3RvciIsIlBsYXRmb3JtUmVmXy5hcHBsaWNhdGlvbiIsIlBsYXRmb3JtUmVmXy5hc3luY0FwcGxpY2F0aW9uIiwiUGxhdGZvcm1SZWZfLl9pbml0QXBwIiwiUGxhdGZvcm1SZWZfLmRpc3Bvc2UiLCJQbGF0Zm9ybVJlZl8uX2FwcGxpY2F0aW9uRGlzcG9zZWQiLCJfcnVuQXBwSW5pdGlhbGl6ZXJzIiwiQXBwbGljYXRpb25SZWYiLCJBcHBsaWNhdGlvblJlZi5jb25zdHJ1Y3RvciIsIkFwcGxpY2F0aW9uUmVmLmluamVjdG9yIiwiQXBwbGljYXRpb25SZWYuem9uZSIsIkFwcGxpY2F0aW9uUmVmLmNvbXBvbmVudFR5cGVzIiwiQXBwbGljYXRpb25SZWZfIiwiQXBwbGljYXRpb25SZWZfLmNvbnN0cnVjdG9yIiwiQXBwbGljYXRpb25SZWZfLnJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIiLCJBcHBsaWNhdGlvblJlZl8ucmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIiLCJBcHBsaWNhdGlvblJlZl8ucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvciIsIkFwcGxpY2F0aW9uUmVmXy51bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IiLCJBcHBsaWNhdGlvblJlZl8uYm9vdHN0cmFwIiwiQXBwbGljYXRpb25SZWZfLl9sb2FkQ29tcG9uZW50IiwiQXBwbGljYXRpb25SZWZfLl91bmxvYWRDb21wb25lbnQiLCJBcHBsaWNhdGlvblJlZl8uaW5qZWN0b3IiLCJBcHBsaWNhdGlvblJlZl8uem9uZSIsIkFwcGxpY2F0aW9uUmVmXy50aWNrIiwiQXBwbGljYXRpb25SZWZfLmRpc3Bvc2UiLCJBcHBsaWNhdGlvblJlZl8uY29tcG9uZW50VHlwZXMiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0JBQXFCLGdDQUFnQyxDQUFDLENBQUE7QUFDdEQscUJBT08sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQyxtQkFBdUQsc0JBQXNCLENBQUMsQ0FBQTtBQUM5RSxtQ0FNTyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzlCLHNCQUtPLDJCQUEyQixDQUFDLENBQUE7QUFDbkMsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QsNEJBQStDLDJDQUEyQyxDQUFDLENBQUE7QUFDM0YseUNBR08sbURBQW1ELENBQUMsQ0FBQTtBQUMzRCwyQkFLTyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ3hDLHdCQUFzQiwyQkFBMkIsQ0FBQyxDQUFBO0FBQ2xELHdCQUFtRCxtQkFBbUIsQ0FBQyxDQUFBO0FBRXZFLHFCQUF1QiwwQkFBMEIsQ0FBQyxDQUFBO0FBR2xEOztHQUVHO0FBQ0gsNkJBQTZCLGdCQUFzQjtJQUNqREEsTUFBTUEsQ0FBQ0E7UUFDTEEsWUFBT0EsQ0FBQ0Esa0NBQWFBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLGdCQUFnQkEsRUFBQ0EsQ0FBQ0E7UUFDcERBLFlBQU9BLENBQUNBLDhDQUF5QkEsRUFDekJBO1lBQ0VBLFVBQVVBLEVBQUVBLFVBQUNBLHNCQUE4Q0EsRUFBRUEsTUFBdUJBLEVBQ3ZFQSxRQUFrQkE7Z0JBQzdCQSw0Q0FBNENBO2dCQUM1Q0EsSUFBSUEsR0FBaUJBLENBQUNBO2dCQUN0QkEsMEVBQTBFQTtnQkFDMUVBLE1BQU1BLENBQUNBLHNCQUFz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QStCYSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQWI7SUF0SWpFQSxnQkFBZ0JBO0lBQ1RBLDBCQUFVQSxHQUFlQSx3QkFBY0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxDQUFDQTtJQXNJMUVBLHNCQUFDQTtBQUFEQSxDQUFDQSxBQXhJRCxFQUFxQyxjQUFjLEVBd0lsRDtBQXhJWSx1QkFBZSxrQkF3STNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nWm9uZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgYXNzZXJ0aW9uc0VuYWJsZWQsXG4gIHByaW50LFxuICBJU19EQVJUXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge3Byb3ZpZGUsIFByb3ZpZGVyLCBJbmplY3RvciwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIEFQUF9DT01QT05FTlRfUkVGX1BST01JU0UsXG4gIEFQUF9DT01QT05FTlQsXG4gIEFQUF9JRF9SQU5ET01fUFJPVklERVIsXG4gIFBMQVRGT1JNX0lOSVRJQUxJWkVSLFxuICBBUFBfSU5JVElBTElaRVJcbn0gZnJvbSAnLi9hcHBsaWNhdGlvbl90b2tlbnMnO1xuaW1wb3J0IHtcbiAgUHJvbWlzZSxcbiAgUHJvbWlzZVdyYXBwZXIsXG4gIFByb21pc2VDb21wbGV0ZXIsXG4gIE9ic2VydmFibGVXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7VGVzdGFiaWxpdHlSZWdpc3RyeSwgVGVzdGFiaWxpdHl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Rlc3RhYmlsaXR5L3Rlc3RhYmlsaXR5JztcbmltcG9ydCB7XG4gIENvbXBvbmVudFJlZixcbiAgRHluYW1pY0NvbXBvbmVudExvYWRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZHluYW1pY19jb21wb25lbnRfbG9hZGVyJztcbmltcG9ydCB7XG4gIEJhc2VFeGNlcHRpb24sXG4gIFdyYXBwZWRFeGNlcHRpb24sXG4gIEV4Y2VwdGlvbkhhbmRsZXIsXG4gIHVuaW1wbGVtZW50ZWRcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7Q29uc29sZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY29uc29sZSc7XG5pbXBvcnQge3d0ZkxlYXZlLCB3dGZDcmVhdGVTY29wZSwgV3RmU2NvcGVGbn0gZnJvbSAnLi9wcm9maWxlL3Byb2ZpbGUnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0b3JfcmVmJztcbmltcG9ydCB7bG9ja01vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0VsZW1lbnRSZWZffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYnO1xuXG4vKipcbiAqIENvbnN0cnVjdCBwcm92aWRlcnMgc3BlY2lmaWMgdG8gYW4gaW5kaXZpZHVhbCByb290IGNvbXBvbmVudC5cbiAqL1xuZnVuY3Rpb24gX2NvbXBvbmVudFByb3ZpZGVycyhhcHBDb21wb25lbnRUeXBlOiBUeXBlKTogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+IHtcbiAgcmV0dXJuIFtcbiAgICBwcm92aWRlKEFQUF9DT01QT05FTlQsIHt1c2VWYWx1ZTogYXBwQ29tcG9uZW50VHlwZX0pLFxuICAgIHByb3ZpZGUoQVBQX0NPTVBPTkVOVF9SRUZfUFJPTUlTRSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdXNlRmFjdG9yeTogKGR5bmFtaWNDb21wb25lbnRMb2FkZXI6IER5bmFtaWNDb21wb25lbnRMb2FkZXIsIGFwcFJlZjogQXBwbGljYXRpb25SZWZfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgQ29tcG9uZW50UmVmIGZvciBkaXNwb3NhbCBsYXRlci5cbiAgICAgICAgICAgICAgICB2YXIgcmVmOiBDb21wb25lbnRSZWY7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyhyYWRvKTogaW52ZXN0aWdhdGUgd2hldGhlciB0byBzdXBwb3J0IHByb3ZpZGVycyBvbiByb290IGNvbXBvbmVudC5cbiAgICAgICAgICAgICAgICByZXR1cm4gZHluYW1pY0NvbXBvbmVudExvYWRlci5sb2FkQXNSb290KGFwcENvbXBvbmVudFR5cGUsIG51bGwsIGluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4geyBhcHBSZWYuX3VubG9hZENvbXBvbmVudChyZWYpOyB9KVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoY29tcG9uZW50UmVmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmVmID0gY29tcG9uZW50UmVmO1xuICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldE9wdGlvbmFsKFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KHRlc3RhYmlsaXR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQsIHRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbXBvbmVudFJlZjtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRlcHM6IFtEeW5hbWljQ29tcG9uZW50TG9hZGVyLCBBcHBsaWNhdGlvblJlZiwgSW5qZWN0b3JdXG4gICAgICAgICAgICB9KSxcbiAgICBwcm92aWRlKGFwcENvbXBvbmVudFR5cGUsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHVzZUZhY3Rvcnk6IChwOiBQcm9taXNlPGFueT4pID0+IHAudGhlbihyZWYgPT4gcmVmLmluc3RhbmNlKSxcbiAgICAgICAgICAgICAgZGVwczogW0FQUF9DT01QT05FTlRfUkVGX1BST01JU0VdXG4gICAgICAgICAgICB9KSxcbiAgXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gQW5ndWxhciB6b25lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTmdab25lKCk6IE5nWm9uZSB7XG4gIHJldHVybiBuZXcgTmdab25lKHtlbmFibGVMb25nU3RhY2tUcmFjZTogYXNzZXJ0aW9uc0VuYWJsZWQoKX0pO1xufVxuXG52YXIgX3BsYXRmb3JtOiBQbGF0Zm9ybVJlZjtcbnZhciBfcGxhdGZvcm1Qcm92aWRlcnM6IGFueVtdO1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIEFuZ3VsYXIgJ3BsYXRmb3JtJyBvbiB0aGUgcGFnZS5cbiAqXG4gKiBTZWUge0BsaW5rIFBsYXRmb3JtUmVmfSBmb3IgZGV0YWlscyBvbiB0aGUgQW5ndWxhciBwbGF0Zm9ybS5cbiAqXG4gKiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIHNwZWNpZnkgcHJvdmlkZXJzIHRvIGJlIG1hZGUgaW4gdGhlIG5ldyBwbGF0Zm9ybS4gVGhlc2UgcHJvdmlkZXJzXG4gKiB3aWxsIGJlIHNoYXJlZCBiZXR3ZWVuIGFsbCBhcHBsaWNhdGlvbnMgb24gdGhlIHBhZ2UuIEZvciBleGFtcGxlLCBhbiBhYnN0cmFjdGlvbiBmb3JcbiAqIHRoZSBicm93c2VyIGNvb2tpZSBqYXIgc2hvdWxkIGJlIGJvdW5kIGF0IHRoZSBwbGF0Zm9ybSBsZXZlbCwgYmVjYXVzZSB0aGVyZSBpcyBvbmx5IG9uZVxuICogY29va2llIGphciByZWdhcmRsZXNzIG9mIGhvdyBtYW55IGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZSB3aWxsIGJlIGFjY2Vzc2luZyBpdC5cbiAqXG4gKiBUaGUgcGxhdGZvcm0gZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBhcyBsb25nIGFzIHRoZSBzYW1lIGxpc3Qgb2YgcHJvdmlkZXJzXG4gKiBpcyBwYXNzZWQgaW50byBlYWNoIGNhbGwuIElmIHRoZSBwbGF0Zm9ybSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhIGRpZmZlcmVudCBzZXQgb2ZcbiAqIHByb3ZpZGVzLCBBbmd1bGFyIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGxhdGZvcm0ocHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUGxhdGZvcm1SZWYge1xuICBsb2NrTW9kZSgpO1xuICBpZiAoaXNQcmVzZW50KF9wbGF0Zm9ybSkpIHtcbiAgICBpZiAoTGlzdFdyYXBwZXIuZXF1YWxzKF9wbGF0Zm9ybVByb3ZpZGVycywgcHJvdmlkZXJzKSkge1xuICAgICAgcmV0dXJuIF9wbGF0Zm9ybTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJwbGF0Zm9ybSBjYW5ub3QgYmUgaW5pdGlhbGl6ZWQgd2l0aCBkaWZmZXJlbnQgc2V0cyBvZiBwcm92aWRlcnMuXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gX2NyZWF0ZVBsYXRmb3JtKHByb3ZpZGVycyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwb3NlIHRoZSBleGlzdGluZyBwbGF0Zm9ybS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3Bvc2VQbGF0Zm9ybSgpOiB2b2lkIHtcbiAgaWYgKGlzUHJlc2VudChfcGxhdGZvcm0pKSB7XG4gICAgX3BsYXRmb3JtLmRpc3Bvc2UoKTtcbiAgICBfcGxhdGZvcm0gPSBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVQbGF0Zm9ybShwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQbGF0Zm9ybVJlZiB7XG4gIF9wbGF0Zm9ybVByb3ZpZGVycyA9IHByb3ZpZGVycztcbiAgbGV0IGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShwcm92aWRlcnMpO1xuICBfcGxhdGZvcm0gPSBuZXcgUGxhdGZvcm1SZWZfKGluamVjdG9yLCAoKSA9PiB7XG4gICAgX3BsYXRmb3JtID0gbnVsbDtcbiAgICBfcGxhdGZvcm1Qcm92aWRlcnMgPSBudWxsO1xuICB9KTtcbiAgX3J1blBsYXRmb3JtSW5pdGlhbGl6ZXJzKGluamVjdG9yKTtcbiAgcmV0dXJuIF9wbGF0Zm9ybTtcbn1cblxuZnVuY3Rpb24gX3J1blBsYXRmb3JtSW5pdGlhbGl6ZXJzKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICBsZXQgaW5pdHM6IEZ1bmN0aW9uW10gPSBpbmplY3Rvci5nZXRPcHRpb25hbChQTEFURk9STV9JTklUSUFMSVpFUik7XG4gIGlmIChpc1ByZXNlbnQoaW5pdHMpKSBpbml0cy5mb3JFYWNoKGluaXQgPT4gaW5pdCgpKTtcbn1cblxuLyoqXG4gKiBUaGUgQW5ndWxhciBwbGF0Zm9ybSBpcyB0aGUgZW50cnkgcG9pbnQgZm9yIEFuZ3VsYXIgb24gYSB3ZWIgcGFnZS4gRWFjaCBwYWdlXG4gKiBoYXMgZXhhY3RseSBvbmUgcGxhdGZvcm0sIGFuZCBzZXJ2aWNlcyAoc3VjaCBhcyByZWZsZWN0aW9uKSB3aGljaCBhcmUgY29tbW9uXG4gKiB0byBldmVyeSBBbmd1bGFyIGFwcGxpY2F0aW9uIHJ1bm5pbmcgb24gdGhlIHBhZ2UgYXJlIGJvdW5kIGluIGl0cyBzY29wZS5cbiAqXG4gKiBBIHBhZ2UncyBwbGF0Zm9ybSBpcyBpbml0aWFsaXplZCBpbXBsaWNpdGx5IHdoZW4ge0BsaW5rIGJvb3RzdHJhcH0oKSBpcyBjYWxsZWQsIG9yXG4gKiBleHBsaWNpdGx5IGJ5IGNhbGxpbmcge0BsaW5rIHBsYXRmb3JtfSgpLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUGxhdGZvcm1SZWYge1xuICAvKipcbiAgICogUmVnaXN0ZXIgYSBsaXN0ZW5lciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgcGxhdGZvcm0gaXMgZGlzcG9zZWQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIHBsYXRmb3JtIHtAbGluayBJbmplY3Rvcn0sIHdoaWNoIGlzIHRoZSBwYXJlbnQgaW5qZWN0b3IgZm9yXG4gICAqIGV2ZXJ5IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UgYW5kIHByb3ZpZGVzIHNpbmdsZXRvbiBwcm92aWRlcnMuXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZSBhIG5ldyBBbmd1bGFyIGFwcGxpY2F0aW9uIG9uIHRoZSBwYWdlLlxuICAgKlxuICAgKiAjIyMgV2hhdCBpcyBhbiBhcHBsaWNhdGlvbj9cbiAgICpcbiAgICogRWFjaCBBbmd1bGFyIGFwcGxpY2F0aW9uIGhhcyBpdHMgb3duIHpvbmUsIGNoYW5nZSBkZXRlY3Rpb24sIGNvbXBpbGVyLFxuICAgKiByZW5kZXJlciwgYW5kIG90aGVyIGZyYW1ld29yayBjb21wb25lbnRzLiBBbiBhcHBsaWNhdGlvbiBob3N0cyBvbmUgb3IgbW9yZVxuICAgKiByb290IGNvbXBvbmVudHMsIHdoaWNoIGNhbiBiZSBpbml0aWFsaXplZCB2aWEgYEFwcGxpY2F0aW9uUmVmLmJvb3RzdHJhcCgpYC5cbiAgICpcbiAgICogIyMjIEFwcGxpY2F0aW9uIFByb3ZpZGVyc1xuICAgKlxuICAgKiBBbmd1bGFyIGFwcGxpY2F0aW9ucyByZXF1aXJlIG51bWVyb3VzIHByb3ZpZGVycyB0byBiZSBwcm9wZXJseSBpbnN0YW50aWF0ZWQuXG4gICAqIFdoZW4gdXNpbmcgYGFwcGxpY2F0aW9uKClgIHRvIGNyZWF0ZSBhIG5ldyBhcHAgb24gdGhlIHBhZ2UsIHRoZXNlIHByb3ZpZGVyc1xuICAgKiBtdXN0IGJlIHByb3ZpZGVkLiBGb3J0dW5hdGVseSwgdGhlcmUgYXJlIGhlbHBlciBmdW5jdGlvbnMgdG8gY29uZmlndXJlXG4gICAqIHR5cGljYWwgcHJvdmlkZXJzLCBhcyBzaG93biBpbiB0aGUgZXhhbXBsZSBiZWxvdy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvcGxhdGZvcm0vcGxhdGZvcm0udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gICAqICMjIyBTZWUgQWxzb1xuICAgKlxuICAgKiBTZWUgdGhlIHtAbGluayBib290c3RyYXB9IGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAgICovXG4gIGFic3RyYWN0IGFwcGxpY2F0aW9uKHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogQXBwbGljYXRpb25SZWY7XG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIGEgbmV3IEFuZ3VsYXIgYXBwbGljYXRpb24gb24gdGhlIHBhZ2UsIHVzaW5nIHByb3ZpZGVycyB3aGljaFxuICAgKiBhcmUgb25seSBhdmFpbGFibGUgYXN5bmNocm9ub3VzbHkuIE9uZSBzdWNoIHVzZSBjYXNlIGlzIHRvIGluaXRpYWxpemUgYW5cbiAgICogYXBwbGljYXRpb24gcnVubmluZyBpbiBhIHdlYiB3b3JrZXIuXG4gICAqXG4gICAqICMjIyBVc2FnZVxuICAgKlxuICAgKiBgYmluZGluZ0ZuYCBpcyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgaW4gdGhlIG5ldyBhcHBsaWNhdGlvbidzIHpvbmUuXG4gICAqIEl0IHNob3VsZCByZXR1cm4gYSBgUHJvbWlzZWAgdG8gYSBsaXN0IG9mIHByb3ZpZGVycyB0byBiZSB1c2VkIGZvciB0aGVcbiAgICogbmV3IGFwcGxpY2F0aW9uLiBPbmNlIHRoaXMgcHJvbWlzZSByZXNvbHZlcywgdGhlIGFwcGxpY2F0aW9uIHdpbGwgYmVcbiAgICogY29uc3RydWN0ZWQgaW4gdGhlIHNhbWUgbWFubmVyIGFzIGEgbm9ybWFsIGBhcHBsaWNhdGlvbigpYC5cbiAgICovXG4gIGFic3RyYWN0IGFzeW5jQXBwbGljYXRpb24oYmluZGluZ0ZuOiAoem9uZTogTmdab25lKSA9PiBQcm9taXNlPEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzPzogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KTogUHJvbWlzZTxBcHBsaWNhdGlvblJlZj47XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIEFuZ3VsYXIgcGxhdGZvcm0gYW5kIGFsbCBBbmd1bGFyIGFwcGxpY2F0aW9ucyBvbiB0aGUgcGFnZS5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtUmVmXyBleHRlbmRzIFBsYXRmb3JtUmVmIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYXBwbGljYXRpb25zOiBBcHBsaWNhdGlvblJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Rpc3Bvc2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgX2Rpc3Bvc2U6ICgpID0+IHZvaWQpIHsgc3VwZXIoKTsgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgYXBwbGljYXRpb24ocHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBBcHBsaWNhdGlvblJlZiB7XG4gICAgdmFyIGFwcCA9IHRoaXMuX2luaXRBcHAoY3JlYXRlTmdab25lKCksIHByb3ZpZGVycyk7XG4gICAgaWYgKFByb21pc2VXcmFwcGVyLmlzUHJvbWlzZShhcHApKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBcIkNhbm5vdCB1c2UgYXN5bmNyb25vdXMgYXBwIGluaXRpYWxpemVycyB3aXRoIGFwcGxpY2F0aW9uLiBVc2UgYXN5bmNBcHBsaWNhdGlvbiBpbnN0ZWFkLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIDxBcHBsaWNhdGlvblJlZj5hcHA7XG4gIH1cblxuICBhc3luY0FwcGxpY2F0aW9uKGJpbmRpbmdGbjogKHpvbmU6IE5nWm9uZSkgPT4gUHJvbWlzZTxBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4+LFxuICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxQcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPEFwcGxpY2F0aW9uUmVmPiB7XG4gICAgdmFyIHpvbmUgPSBjcmVhdGVOZ1pvbmUoKTtcbiAgICB2YXIgY29tcGxldGVyID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgaWYgKGJpbmRpbmdGbiA9PT0gbnVsbCkge1xuICAgICAgY29tcGxldGVyLnJlc29sdmUodGhpcy5faW5pdEFwcCh6b25lLCBhZGRpdGlvbmFsUHJvdmlkZXJzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgUHJvbWlzZVdyYXBwZXIudGhlbihiaW5kaW5nRm4oem9uZSksIChwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPikgPT4ge1xuICAgICAgICAgIGlmIChpc1ByZXNlbnQoYWRkaXRpb25hbFByb3ZpZGVycykpIHtcbiAgICAgICAgICAgIHByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNvbmNhdChwcm92aWRlcnMsIGFkZGl0aW9uYWxQcm92aWRlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgcHJvbWlzZSA9IHRoaXMuX2luaXRBcHAoem9uZSwgcHJvdmlkZXJzKTtcbiAgICAgICAgICBjb21wbGV0ZXIucmVzb2x2ZShwcm9taXNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBsZXRlci5wcm9taXNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5pdEFwcCh6b25lOiBOZ1pvbmUsXG4gICAgICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPEFwcGxpY2F0aW9uUmVmPnxcbiAgICAgIEFwcGxpY2F0aW9uUmVmIHtcbiAgICB2YXIgaW5qZWN0b3I6IEluamVjdG9yO1xuICAgIHZhciBhcHA6IEFwcGxpY2F0aW9uUmVmO1xuICAgIHpvbmUucnVuKCgpID0+IHtcbiAgICAgIHByb3ZpZGVycyA9IExpc3RXcmFwcGVyLmNvbmNhdChwcm92aWRlcnMsIFtcbiAgICAgICAgcHJvdmlkZShOZ1pvbmUsIHt1c2VWYWx1ZTogem9uZX0pLFxuICAgICAgICBwcm92aWRlKEFwcGxpY2F0aW9uUmVmLCB7dXNlRmFjdG9yeTogKCk6IEFwcGxpY2F0aW9uUmVmID0+IGFwcCwgZGVwczogW119KVxuICAgICAgXSk7XG5cbiAgICAgIHZhciBleGNlcHRpb25IYW5kbGVyO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaW5qZWN0b3IgPSB0aGlzLmluamVjdG9yLnJlc29sdmVBbmRDcmVhdGVDaGlsZChwcm92aWRlcnMpO1xuICAgICAgICBleGNlcHRpb25IYW5kbGVyID0gaW5qZWN0b3IuZ2V0KEV4Y2VwdGlvbkhhbmRsZXIpO1xuICAgICAgICB6b25lLm92ZXJyaWRlT25FcnJvckhhbmRsZXIoKGUsIHMpID0+IGV4Y2VwdGlvbkhhbmRsZXIuY2FsbChlLCBzKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZXhjZXB0aW9uSGFuZGxlcikpIHtcbiAgICAgICAgICBleGNlcHRpb25IYW5kbGVyLmNhbGwoZSwgZS5zdGFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJpbnQoZS50b1N0cmluZygpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGFwcCA9IG5ldyBBcHBsaWNhdGlvblJlZl8odGhpcywgem9uZSwgaW5qZWN0b3IpO1xuICAgIHRoaXMuX2FwcGxpY2F0aW9ucy5wdXNoKGFwcCk7XG4gICAgdmFyIHByb21pc2UgPSBfcnVuQXBwSW5pdGlhbGl6ZXJzKGluamVjdG9yKTtcbiAgICBpZiAocHJvbWlzZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnRoZW4ocHJvbWlzZSwgKF8pID0+IGFwcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhcHA7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBMaXN0V3JhcHBlci5jbG9uZSh0aGlzLl9hcHBsaWNhdGlvbnMpLmZvckVhY2goKGFwcCkgPT4gYXBwLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5mb3JFYWNoKChkaXNwb3NlKSA9PiBkaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FwcGxpY2F0aW9uRGlzcG9zZWQoYXBwOiBBcHBsaWNhdGlvblJlZik6IHZvaWQgeyBMaXN0V3JhcHBlci5yZW1vdmUodGhpcy5fYXBwbGljYXRpb25zLCBhcHApOyB9XG59XG5cbmZ1bmN0aW9uIF9ydW5BcHBJbml0aWFsaXplcnMoaW5qZWN0b3I6IEluamVjdG9yKTogUHJvbWlzZTxhbnk+IHtcbiAgbGV0IGluaXRzOiBGdW5jdGlvbltdID0gaW5qZWN0b3IuZ2V0T3B0aW9uYWwoQVBQX0lOSVRJQUxJWkVSKTtcbiAgbGV0IHByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuICBpZiAoaXNQcmVzZW50KGluaXRzKSkge1xuICAgIGluaXRzLmZvckVhY2goaW5pdCA9PiB7XG4gICAgICB2YXIgcmV0VmFsID0gaW5pdCgpO1xuICAgICAgaWYgKFByb21pc2VXcmFwcGVyLmlzUHJvbWlzZShyZXRWYWwpKSB7XG4gICAgICAgIHByb21pc2VzLnB1c2gocmV0VmFsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAocHJvbWlzZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwocHJvbWlzZXMpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogQSByZWZlcmVuY2UgdG8gYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBydW5uaW5nIG9uIGEgcGFnZS5cbiAqXG4gKiBGb3IgbW9yZSBhYm91dCBBbmd1bGFyIGFwcGxpY2F0aW9ucywgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB7QGxpbmsgYm9vdHN0cmFwfS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFwcGxpY2F0aW9uUmVmIHtcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgbGlzdGVuZXIgdG8gYmUgY2FsbGVkIGVhY2ggdGltZSBgYm9vdHN0cmFwKClgIGlzIGNhbGxlZCB0byBib290c3RyYXBcbiAgICogYSBuZXcgcm9vdCBjb21wb25lbnQuXG4gICAqL1xuICBhYnN0cmFjdCByZWdpc3RlckJvb3RzdHJhcExpc3RlbmVyKGxpc3RlbmVyOiAocmVmOiBDb21wb25lbnRSZWYpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGxpc3RlbmVyIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpcyBkaXNwb3NlZC5cbiAgICovXG4gIGFic3RyYWN0IHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBuZXcgY29tcG9uZW50IGF0IHRoZSByb290IGxldmVsIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogIyMjIEJvb3RzdHJhcCBwcm9jZXNzXG4gICAqXG4gICAqIFdoZW4gYm9vdHN0cmFwcGluZyBhIG5ldyByb290IGNvbXBvbmVudCBpbnRvIGFuIGFwcGxpY2F0aW9uLCBBbmd1bGFyIG1vdW50cyB0aGVcbiAgICogc3BlY2lmaWVkIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBvbnRvIERPTSBlbGVtZW50cyBpZGVudGlmaWVkIGJ5IHRoZSBbY29tcG9uZW50VHlwZV0nc1xuICAgKiBzZWxlY3RvciBhbmQga2lja3Mgb2ZmIGF1dG9tYXRpYyBjaGFuZ2UgZGV0ZWN0aW9uIHRvIGZpbmlzaCBpbml0aWFsaXppbmcgdGhlIGNvbXBvbmVudC5cbiAgICpcbiAgICogIyMjIE9wdGlvbmFsIFByb3ZpZGVyc1xuICAgKlxuICAgKiBQcm92aWRlcnMgZm9yIHRoZSBnaXZlbiBjb21wb25lbnQgY2FuIG9wdGlvbmFsbHkgYmUgb3ZlcnJpZGRlbiB2aWEgdGhlIGBwcm92aWRlcnNgXG4gICAqIHBhcmFtZXRlci4gVGhlc2UgcHJvdmlkZXJzIHdpbGwgb25seSBhcHBseSBmb3IgdGhlIHJvb3QgY29tcG9uZW50IGJlaW5nIGFkZGVkIGFuZCBhbnlcbiAgICogY2hpbGQgY29tcG9uZW50cyB1bmRlciBpdC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICoge0BleGFtcGxlIGNvcmUvdHMvcGxhdGZvcm0vcGxhdGZvcm0udHMgcmVnaW9uPSdsb25nZm9ybSd9XG4gICAqL1xuICBhYnN0cmFjdCBib290c3RyYXAoY29tcG9uZW50VHlwZTogVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVycz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFByb21pc2U8Q29tcG9uZW50UmVmPjtcblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFwcGxpY2F0aW9uIHtAbGluayBJbmplY3Rvcn0uXG4gICAqL1xuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYXBwbGljYXRpb24ge0BsaW5rIE5nWm9uZX0uXG4gICAqL1xuICBnZXQgem9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHRoaXMgYXBwbGljYXRpb24gYW5kIGFsbCBvZiBpdHMgY29tcG9uZW50cy5cbiAgICovXG4gIGFic3RyYWN0IGRpc3Bvc2UoKTogdm9pZDtcblxuICAvKipcbiAgICogSW52b2tlIHRoaXMgbWV0aG9kIHRvIGV4cGxpY2l0bHkgcHJvY2VzcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBpdHMgc2lkZS1lZmZlY3RzLlxuICAgKlxuICAgKiBJbiBkZXZlbG9wbWVudCBtb2RlLCBgdGljaygpYCBhbHNvIHBlcmZvcm1zIGEgc2Vjb25kIGNoYW5nZSBkZXRlY3Rpb24gY3ljbGUgdG8gZW5zdXJlIHRoYXQgbm9cbiAgICogZnVydGhlciBjaGFuZ2VzIGFyZSBkZXRlY3RlZC4gSWYgYWRkaXRpb25hbCBjaGFuZ2VzIGFyZSBwaWNrZWQgdXAgZHVyaW5nIHRoaXMgc2Vjb25kIGN5Y2xlLFxuICAgKiBiaW5kaW5ncyBpbiB0aGUgYXBwIGhhdmUgc2lkZS1lZmZlY3RzIHRoYXQgY2Fubm90IGJlIHJlc29sdmVkIGluIGEgc2luZ2xlIGNoYW5nZSBkZXRlY3Rpb25cbiAgICogcGFzcy5cbiAgICogSW4gdGhpcyBjYXNlLCBBbmd1bGFyIHRocm93cyBhbiBlcnJvciwgc2luY2UgYW4gQW5ndWxhciBhcHBsaWNhdGlvbiBjYW4gb25seSBoYXZlIG9uZSBjaGFuZ2VcbiAgICogZGV0ZWN0aW9uIHBhc3MgZHVyaW5nIHdoaWNoIGFsbCBjaGFuZ2UgZGV0ZWN0aW9uIG11c3QgY29tcGxldGUuXG4gICAqL1xuICBhYnN0cmFjdCB0aWNrKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgY29tcG9uZW50IHR5cGVzIHJlZ2lzdGVyZWQgdG8gdGhpcyBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xufVxuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25SZWZfIGV4dGVuZHMgQXBwbGljYXRpb25SZWYge1xuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfdGlja1Njb3BlOiBXdGZTY29wZUZuID0gd3RmQ3JlYXRlU2NvcGUoJ0FwcGxpY2F0aW9uUmVmI3RpY2soKScpO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwTGlzdGVuZXJzOiBGdW5jdGlvbltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfZGlzcG9zZUxpc3RlbmVyczogRnVuY3Rpb25bXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3Jvb3RDb21wb25lbnRzOiBDb21wb25lbnRSZWZbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX3Jvb3RDb21wb25lbnRUeXBlczogVHlwZVtdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWZzOiBDaGFuZ2VEZXRlY3RvclJlZltdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcnVubmluZ1RpY2s6IGJvb2xlYW4gPSBmYWxzZTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9lbmZvcmNlTm9OZXdDaGFuZ2VzOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtUmVmXywgcHJpdmF0ZSBfem9uZTogTmdab25lLCBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICBzdXBlcigpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fem9uZSkpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl96b25lLm9uVHVybkRvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8pID0+IHsgdGhpcy5fem9uZS5ydW4oKCkgPT4geyB0aGlzLnRpY2soKTsgfSk7IH0pO1xuICAgIH1cbiAgICB0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzID0gYXNzZXJ0aW9uc0VuYWJsZWQoKTtcbiAgfVxuXG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKGRpc3Bvc2U6ICgpID0+IHZvaWQpOiB2b2lkIHsgdGhpcy5fZGlzcG9zZUxpc3RlbmVycy5wdXNoKGRpc3Bvc2UpOyB9XG5cbiAgcmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWYpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZnMucHVzaChjaGFuZ2VEZXRlY3Rvcik7XG4gIH1cblxuICB1bnJlZ2lzdGVyQ2hhbmdlRGV0ZWN0b3IoY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmKTogdm9pZCB7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcywgY2hhbmdlRGV0ZWN0b3IpO1xuICB9XG5cbiAgYm9vdHN0cmFwKGNvbXBvbmVudFR5cGU6IFR5cGUsXG4gICAgICAgICAgICBwcm92aWRlcnM/OiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pOiBQcm9taXNlPENvbXBvbmVudFJlZj4ge1xuICAgIHZhciBjb21wbGV0ZXIgPSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICB0aGlzLl96b25lLnJ1bigoKSA9PiB7XG4gICAgICB2YXIgY29tcG9uZW50UHJvdmlkZXJzID0gX2NvbXBvbmVudFByb3ZpZGVycyhjb21wb25lbnRUeXBlKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXJzKSkge1xuICAgICAgICBjb21wb25lbnRQcm92aWRlcnMucHVzaChwcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgdmFyIGV4Y2VwdGlvbkhhbmRsZXIgPSB0aGlzLl9pbmplY3Rvci5nZXQoRXhjZXB0aW9uSGFuZGxlcik7XG4gICAgICB0aGlzLl9yb290Q29tcG9uZW50VHlwZXMucHVzaChjb21wb25lbnRUeXBlKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBpbmplY3RvcjogSW5qZWN0b3IgPSB0aGlzLl9pbmplY3Rvci5yZXNvbHZlQW5kQ3JlYXRlQ2hpbGQoY29tcG9uZW50UHJvdmlkZXJzKTtcbiAgICAgICAgdmFyIGNvbXBSZWZUb2tlbjogUHJvbWlzZTxDb21wb25lbnRSZWY+ID0gaW5qZWN0b3IuZ2V0KEFQUF9DT01QT05FTlRfUkVGX1BST01JU0UpO1xuICAgICAgICB2YXIgdGljayA9IChjb21wb25lbnRSZWYpID0+IHtcbiAgICAgICAgICB0aGlzLl9sb2FkQ29tcG9uZW50KGNvbXBvbmVudFJlZik7XG4gICAgICAgICAgY29tcGxldGVyLnJlc29sdmUoY29tcG9uZW50UmVmKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgdGlja1Jlc3VsdCA9IFByb21pc2VXcmFwcGVyLnRoZW4oY29tcFJlZlRva2VuLCB0aWNrKTtcblxuICAgICAgICAvLyBUSElTIE1VU1QgT05MWSBSVU4gSU4gREFSVC5cbiAgICAgICAgLy8gVGhpcyBpcyByZXF1aXJlZCB0byByZXBvcnQgYW4gZXJyb3Igd2hlbiBubyBjb21wb25lbnRzIHdpdGggYSBtYXRjaGluZyBzZWxlY3RvciBmb3VuZC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHRoZSBwcm9taXNlIHdpbGwgbmV2ZXIgYmUgY29tcGxldGVkLlxuICAgICAgICAvLyBEb2luZyB0aGlzIGluIEpTIGNhdXNlcyBhbiBleHRyYSBlcnJvciBtZXNzYWdlIHRvIGFwcGVhci5cbiAgICAgICAgaWYgKElTX0RBUlQpIHtcbiAgICAgICAgICBQcm9taXNlV3JhcHBlci50aGVuKHRpY2tSZXN1bHQsIChfKSA9PiB7fSk7XG4gICAgICAgIH1cblxuICAgICAgICBQcm9taXNlV3JhcHBlci50aGVuKHRpY2tSZXN1bHQsIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVyciwgc3RhY2tUcmFjZSkgPT4gY29tcGxldGVyLnJlamVjdChlcnIsIHN0YWNrVHJhY2UpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZXhjZXB0aW9uSGFuZGxlci5jYWxsKGUsIGUuc3RhY2spO1xuICAgICAgICBjb21wbGV0ZXIucmVqZWN0KGUsIGUuc3RhY2spO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21wbGV0ZXIucHJvbWlzZS50aGVuKF8gPT4ge1xuICAgICAgbGV0IGMgPSB0aGlzLl9pbmplY3Rvci5nZXQoQ29uc29sZSk7XG4gICAgICBpZiAoYXNzZXJ0aW9uc0VuYWJsZWQoKSkge1xuICAgICAgICBjLmxvZyhcbiAgICAgICAgICAgIFwiQW5ndWxhciAyIGlzIHJ1bm5pbmcgaW4gdGhlIGRldmVsb3BtZW50IG1vZGUuIENhbGwgZW5hYmxlUHJvZE1vZGUoKSB0byBlbmFibGUgdGhlIHByb2R1Y3Rpb24gbW9kZS5cIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2xvYWRDb21wb25lbnQocmVmKTogdm9pZCB7XG4gICAgdmFyIGFwcENoYW5nZURldGVjdG9yID0gKDxFbGVtZW50UmVmXz5yZWYubG9jYXRpb24pLmludGVybmFsRWxlbWVudC5wYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yO1xuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5wdXNoKGFwcENoYW5nZURldGVjdG9yLnJlZik7XG4gICAgdGhpcy50aWNrKCk7XG4gICAgdGhpcy5fcm9vdENvbXBvbmVudHMucHVzaChyZWYpO1xuICAgIHRoaXMuX2Jvb3RzdHJhcExpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4gbGlzdGVuZXIocmVmKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF91bmxvYWRDb21wb25lbnQocmVmKTogdm9pZCB7XG4gICAgaWYgKCFMaXN0V3JhcHBlci5jb250YWlucyh0aGlzLl9yb290Q29tcG9uZW50cywgcmVmKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnVucmVnaXN0ZXJDaGFuZ2VEZXRlY3RvcihcbiAgICAgICAgKDxFbGVtZW50UmVmXz5yZWYubG9jYXRpb24pLmludGVybmFsRWxlbWVudC5wYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZik7XG4gICAgTGlzdFdyYXBwZXIucmVtb3ZlKHRoaXMuX3Jvb3RDb21wb25lbnRzLCByZWYpO1xuICB9XG5cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgZ2V0IHpvbmUoKTogTmdab25lIHsgcmV0dXJuIHRoaXMuX3pvbmU7IH1cblxuICB0aWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9ydW5uaW5nVGljaykge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJBcHBsaWNhdGlvblJlZi50aWNrIGlzIGNhbGxlZCByZWN1cnNpdmVseVwiKTtcbiAgICB9XG5cbiAgICB2YXIgcyA9IEFwcGxpY2F0aW9uUmVmXy5fdGlja1Njb3BlKCk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5mb3JFYWNoKChkZXRlY3RvcikgPT4gZGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpKTtcbiAgICAgIGlmICh0aGlzLl9lbmZvcmNlTm9OZXdDaGFuZ2VzKSB7XG4gICAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmcy5mb3JFYWNoKChkZXRlY3RvcikgPT4gZGV0ZWN0b3IuY2hlY2tOb0NoYW5nZXMoKSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX3J1bm5pbmdUaWNrID0gZmFsc2U7XG4gICAgICB3dGZMZWF2ZShzKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIFRPRE8oYWx4aHViKTogRGlzcG9zZSBvZiB0aGUgTmdab25lLlxuICAgIExpc3RXcmFwcGVyLmNsb25lKHRoaXMuX3Jvb3RDb21wb25lbnRzKS5mb3JFYWNoKChyZWYpID0+IHJlZi5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX2Rpc3Bvc2VMaXN0ZW5lcnMuZm9yRWFjaCgoZGlzcG9zZSkgPT4gZGlzcG9zZSgpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybS5fYXBwbGljYXRpb25EaXNwb3NlZCh0aGlzKTtcbiAgfVxuXG4gIGdldCBjb21wb25lbnRUeXBlcygpOiBUeXBlW10geyByZXR1cm4gdGhpcy5fcm9vdENvbXBvbmVudFR5cGVzOyB9XG59XG4iXX0=