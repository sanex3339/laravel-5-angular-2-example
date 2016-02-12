"use strict";
var testing_1 = require('angular2/testing');
var value;
var element;
var exception;
var OtherClass = (function () {
    function OtherClass() {
    }
    return OtherClass;
}());
var SomeClass = (function () {
    function SomeClass() {
    }
    return SomeClass;
}());
// #docregion toBePromise
testing_1.expect(value).toBePromise();
// #enddocregion
// #docregion toBeAnInstanceOf
testing_1.expect(value).toBeAnInstanceOf(SomeClass);
// #enddocregion
// #docregion toHaveText
testing_1.expect(element).toHaveText('Hello world!');
// #enddocregion
// #docregion toHaveCssClass
testing_1.expect(element).toHaveCssClass('current');
// #enddocregion
// #docregion toHaveCssStyle
testing_1.expect(element).toHaveCssStyle({ width: '100px', height: 'auto' });
// #enddocregion
// #docregion toContainError
testing_1.expect(exception).toContainError('Failed to load');
// #enddocregion
// #docregion toThrowErrorWith
testing_1.expect(function () { throw 'Failed to load'; }).toThrowErrorWith('Failed to load');
// #enddocregion
// #docregion toImplement
testing_1.expect(SomeClass).toImplement(OtherClass);
// #enddocregion
//# sourceMappingURL=matchers.js.map