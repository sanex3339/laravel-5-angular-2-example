import { ChangeDetectorRef } from '../change_detector_ref';
import { KeyValueDiffer, KeyValueDifferFactory } from '../differs/keyvalue_differs';
export declare class DefaultKeyValueDifferFactory implements KeyValueDifferFactory {
    supports(obj: any): boolean;
    create(cdRef: ChangeDetectorRef): KeyValueDiffer;
}
export declare class DefaultKeyValueDiffer implements KeyValueDiffer {
    private _records;
    private _mapHead;
    private _previousMapHead;
    private _changesHead;
    private _changesTail;
    private _additionsHead;
    private _additionsTail;
    private _removalsHead;
    private _removalsTail;
    readonly isDirty: boolean;
    forEachItem(fn: Function): void;
    forEachPreviousItem(fn: Function): void;
    forEachChangedItem(fn: Function): void;
    forEachAddedItem(fn: Function): void;
    forEachRemovedItem(fn: Function): void;
    diff(map: Map<any, any>): any;
    onDestroy(): void;
    check(map: Map<any, any>): boolean;
    /** @internal */
    _reset(): void;
    /** @internal */
    _truncate(lastRecord: KVChangeRecord, record: KVChangeRecord): void;
    /** @internal */
    _isInRemovals(record: KVChangeRecord): boolean;
    /** @internal */
    _addToRemovals(record: KVChangeRecord): void;
    /** @internal */
    _removeFromSeq(prev: KVChangeRecord, record: KVChangeRecord): void;
    /** @internal */
    _removeFromRemovals(record: KVChangeRecord): void;
    /** @internal */
    _addToAdditions(record: KVChangeRecord): void;
    /** @internal */
    _addToChanges(record: KVChangeRecord): void;
    toString(): string;
    /** @internal */
    _forEach(obj: any, fn: Function): void;
}
export declare class KVChangeRecord {
    key: any;
    previousValue: any;
    currentValue: any;
    /** @internal */
    _nextPrevious: KVChangeRecord;
    /** @internal */
    _next: KVChangeRecord;
    /** @internal */
    _nextAdded: KVChangeRecord;
    /** @internal */
    _nextRemoved: KVChangeRecord;
    /** @internal */
    _prevRemoved: KVChangeRecord;
    /** @internal */
    _nextChanged: KVChangeRecord;
    constructor(key: any);
    toString(): string;
}
