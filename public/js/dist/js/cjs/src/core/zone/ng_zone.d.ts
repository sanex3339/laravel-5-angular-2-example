import { EventEmitter } from 'angular2/src/facade/async';
import { WtfScopeFn } from '../profile/profile';
export interface NgZoneZone extends Zone {
    /** @internal */
    _innerZone: boolean;
}
/**
 * Interface for a function with zero arguments.
 */
export interface ZeroArgFunction {
    (): void;
}
/**
 * Function type for an error handler, which takes an error and a stack trace.
 */
export interface ErrorHandlingFn {
    (error: any, stackTrace: any): void;
}
/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export declare class NgZoneError {
    error: any;
    stackTrace: any;
    constructor(error: any, stackTrace: any);
}
/**
 * An injectable service for executing work inside or outside of the Angular zone.
 *
 * The most common use of this service is to optimize performance when starting a work consisting of
 * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
 * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
 * can reenter the Angular zone via {@link #run}.
 *
 * <!-- TODO: add/fix links to:
 *   - docs explaining zones and the use of zones in Angular and change-detection
 *   - link to runOutsideAngular/run (throughout this file!)
 *   -->
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 * ```
 * import {Component, View, NgZone} from 'angular2/core';
 * import {NgIf} from 'angular2/common';
 *
 * @Component({
 *   selector: 'ng-zone-demo'.
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
 *
 *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
 *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
 *   `,
 *   directives: [NgIf]
 * })
 * export class NgZoneDemo {
 *   progress: number = 0;
 *   label: string;
 *
 *   constructor(private _ngZone: NgZone) {}
 *
 *   // Loop inside the Angular zone
 *   // so the UI DOES refresh after each setTimeout cycle
 *   processWithinAngularZone() {
 *     this.label = 'inside';
 *     this.progress = 0;
 *     this._increaseProgress(() => console.log('Inside Done!'));
 *   }
 *
 *   // Loop outside of the Angular zone
 *   // so the UI DOES NOT refresh after each setTimeout cycle
 *   processOutsideOfAngularZone() {
 *     this.label = 'outside';
 *     this.progress = 0;
 *     this._ngZone.runOutsideAngular(() => {
 *       this._increaseProgress(() => {
 *       // reenter the Angular zone and display done
 *       this._ngZone.run(() => {console.log('Outside Done!') });
 *     }}));
 *   }
 *
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 */
export declare class NgZone {
    /** @internal */
    _runScope: WtfScopeFn;
    /** @internal */
    _microtaskScope: WtfScopeFn;
    /** @internal */
    _mountZone: any;
    /** @internal */
    _innerZone: any;
    /** @internal */
    _onTurnStart: ZeroArgFunction;
    /** @internal */
    _onTurnDone: ZeroArgFunction;
    /** @internal */
    _onEventDone: ZeroArgFunction;
    /** @internal */
    _onErrorHandler: ErrorHandlingFn;
    /** @internal */
    _onTurnStartEvents: EventEmitter<any>;
    /** @internal */
    _onTurnDoneEvents: EventEmitter<any>;
    /** @internal */
    _onEventDoneEvents: EventEmitter<any>;
    /** @internal */
    _onErrorEvents: EventEmitter<any>;
    /** @internal */
    _pendingMicrotasks: number;
    /** @internal */
    _hasExecutedCodeInInnerZone: boolean;
    /** @internal */
    _nestedRun: number;
    /** @internal */
    _disabled: boolean;
    /** @internal */
    _inVmTurnDone: boolean;
    /** @internal */
    _pendingTimeouts: number[];
    /**
     * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
     *               enabled in development mode as they significantly impact perf.
     */
    constructor({enableLongStackTrace}: {
        enableLongStackTrace: any;
    });
    /**
     * Sets the zone hook that is called just before a browser task that is handled by Angular
     * executes.
     *
     * The hook is called once per browser task that is handled by Angular.
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onTurnStart` instead.
     */
    overrideOnTurnStart(onTurnStartHook: ZeroArgFunction): void;
    /**
     * Notifies subscribers just before Angular event turn starts.
     *
     * Emits an event once per browser task that is handled by Angular.
     */
    readonly onTurnStart: any;
    /** @internal */
    _notifyOnTurnStart(parentRun: any): void;
    /**
     * Sets the zone hook that is called immediately after Angular zone is done processing the current
     * task and any microtasks scheduled from that task.
     *
     * This is where we typically do change-detection.
     *
     * The hook is called once per browser task that is handled by Angular.
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onTurnDone` instead.
     */
    overrideOnTurnDone(onTurnDoneHook: ZeroArgFunction): void;
    /**
     * Notifies subscribers immediately after Angular zone is done processing
     * the current turn and any microtasks scheduled from that turn.
     *
     * Used by Angular as a signal to kick off change-detection.
     */
    readonly onTurnDone: EventEmitter<any>;
    /** @internal */
    _notifyOnTurnDone(parentRun: any): void;
    /**
     * Sets the zone hook that is called immediately after the `onTurnDone` callback is called and any
     * microstasks scheduled from within that callback are drained.
     *
     * `onEventDoneFn` is executed outside Angular zone, which means that we will no longer attempt to
     * sync the UI with any model changes that occur within this callback.
     *
     * This hook is useful for validating application state (e.g. in a test).
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onEventDone` instead.
     */
    overrideOnEventDone(onEventDoneFn: ZeroArgFunction, opt_waitForAsync?: boolean): void;
    /**
     * Notifies subscribers immediately after the final `onTurnDone` callback
     * before ending VM event.
     *
     * This event is useful for validating application state (e.g. in a test).
     */
    readonly onEventDone: EventEmitter<any>;
    /** @internal */
    _notifyOnEventDone(): void;
    /**
     * Whether there are any outstanding microtasks.
     */
    readonly hasPendingMicrotasks: boolean;
    /**
     * Whether there are any outstanding timers.
     */
    readonly hasPendingTimers: boolean;
    /**
     * Whether there are any outstanding asychnronous tasks of any kind that are
     * scheduled to run within Angular zone.
     *
     * Useful as a signal of UI stability. For example, when a test reaches a
     * point when [hasPendingAsyncTasks] is `false` it might be a good time to run
     * test expectations.
     */
    readonly hasPendingAsyncTasks: boolean;
    /**
     * Sets the zone hook that is called when an error is thrown in the Angular zone.
     *
     * Setting the hook overrides any previously set hook.
     *
     * @deprecated this API will be removed in the future. Use `onError` instead.
     */
    overrideOnErrorHandler(errorHandler: ErrorHandlingFn): void;
    readonly onError: EventEmitter<any>;
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     */
    run(fn: () => any): any;
    /**
     * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
     * the function.
     *
     * Running functions via `runOutsideAngular` allows you to escape Angular's zone and do work that
     * doesn't trigger Angular change-detection or is subject to Angular's error handling.
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * outside of the Angular zone.
     *
     * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
     */
    runOutsideAngular(fn: () => any): any;
    /** @internal */
    _createInnerZone(zone: any, enableLongStackTrace: any): any;
    /** @internal */
    _notifyOnError(zone: any, e: any): void;
}
