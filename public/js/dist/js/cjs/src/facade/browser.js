"use strict";
/**
 * JS version of browser APIs. This library can only run in the browser.
 */
var win = window;
exports.window = win;
exports.document = window.document;
exports.location = window.location;
exports.gc = window['gc'] ? function () { return window['gc'](); } : function () { return null; };
exports.performance = window['performance'] ? window['performance'] : null;
exports.Event = window['Event'];
exports.MouseEvent = window['MouseEvent'];
exports.KeyboardEvent = window['KeyboardEvent'];
exports.EventTarget = window['EventTarget'];
exports.History = window['History'];
exports.Location = window['Location'];
exports.EventListener = window['EventListener'];
//# sourceMappingURL=browser.js.map