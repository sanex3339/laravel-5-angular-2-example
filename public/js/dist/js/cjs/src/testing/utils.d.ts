export declare class Log {
    /** @internal */
    _result: any[];
    constructor();
    add(value: any): void;
    fn(value: any): (a1?: any, a2?: any, a3?: any, a4?: any, a5?: any) => void;
    clear(): void;
    result(): string;
}
export declare class BrowserDetection {
    private _ua;
    constructor(ua: string);
    readonly isFirefox: boolean;
    readonly isAndroid: boolean;
    readonly isEdge: boolean;
    readonly isIE: boolean;
    readonly isWebkit: boolean;
    readonly isIOS7: boolean;
    readonly isSlow: boolean;
    readonly supportsIntlApi: boolean;
}
export declare var browserDetection: BrowserDetection;
export declare function dispatchEvent(element: any, eventType: any): void;
export declare function el(html: string): HTMLElement;
export declare function containsRegexp(input: string): RegExp;
export declare function normalizeCSS(css: string): string;
export declare function stringifyElement(el: any): string;
