import { ProtoChangeDetector, ChangeDetector, ChangeDetectorDefinition } from './interfaces';
export declare class JitProtoChangeDetector implements ProtoChangeDetector {
    private definition;
    /** @internal */
    _factory: Function;
    constructor(definition: ChangeDetectorDefinition);
    static isSupported(): boolean;
    instantiate(dispatcher: any): ChangeDetector;
    /** @internal */
    _createFactory(definition: ChangeDetectorDefinition): Function;
}
