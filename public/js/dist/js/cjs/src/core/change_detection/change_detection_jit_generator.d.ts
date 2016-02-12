import { ProtoRecord } from './proto_record';
import { EventBinding } from './event_binding';
import { ChangeDetectorDefinition } from './interfaces';
export declare class ChangeDetectorJITGenerator {
    private changeDetectionUtilVarName;
    private abstractChangeDetectorVarName;
    private changeDetectorStateVarName;
    private _logic;
    private _names;
    private _endOfBlockIdxs;
    private id;
    private changeDetectionStrategy;
    private records;
    private propertyBindingTargets;
    private eventBindings;
    private directiveRecords;
    private genConfig;
    typeName: string;
    constructor(definition: ChangeDetectorDefinition, changeDetectionUtilVarName: string, abstractChangeDetectorVarName: string, changeDetectorStateVarName: string);
    generate(): Function;
    generateSource(): string;
    /** @internal */
    _genPropertyBindingTargets(): string;
    /** @internal */
    _genDirectiveIndices(): string;
    /** @internal */
    _maybeGenHandleEventInternal(): string;
    /** @internal */
    _genEventBinding(eb: EventBinding): string;
    /** @internal */
    _genEventBindingEval(eb: EventBinding, r: ProtoRecord): string;
    /** @internal */
    _genMarkPathToRootAsCheckOnce(r: ProtoRecord): string;
    /** @internal */
    _genUpdatePreventDefault(eb: EventBinding, r: ProtoRecord): string;
    /** @internal */
    _maybeGenDehydrateDirectives(): string;
    /** @internal */
    _maybeGenHydrateDirectives(): string;
    /** @internal */
    _maybeGenAfterContentLifecycleCallbacks(): string;
    /** @internal */
    _maybeGenAfterViewLifecycleCallbacks(): string;
    /** @internal */
    _genAllRecords(rs: ProtoRecord[]): string;
    /** @internal */
    _genConditionalSkip(r: ProtoRecord, condition: string): string;
    /** @internal */
    _genUnconditionalSkip(r: ProtoRecord): string;
    /** @internal */
    _genEndOfSkipBlock(protoIndex: number): string;
    /** @internal */
    _genDirectiveLifecycle(r: ProtoRecord): string;
    /** @internal */
    _genPipeCheck(r: ProtoRecord): string;
    /** @internal */
    _genReferenceCheck(r: ProtoRecord): string;
    /** @internal */
    _genChangeMarker(r: ProtoRecord): string;
    /** @internal */
    _genUpdateDirectiveOrElement(r: ProtoRecord): string;
    /** @internal */
    _genThrowOnChangeCheck(oldValue: string, newValue: string): string;
    /** @internal */
    _genAddToChanges(r: ProtoRecord): string;
    /** @internal */
    _maybeFirstInBinding(r: ProtoRecord): string;
    /** @internal */
    _maybeGenLastInDirective(r: ProtoRecord): string;
    /** @internal */
    _genOnCheck(r: ProtoRecord): string;
    /** @internal */
    _genOnInit(r: ProtoRecord): string;
    /** @internal */
    _genOnChange(r: ProtoRecord): string;
    /** @internal */
    _genNotifyOnPushDetectors(r: ProtoRecord): string;
}
