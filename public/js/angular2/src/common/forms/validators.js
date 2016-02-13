'use strict';var lang_1 = require('angular2/src/facade/lang');
var promise_1 = require('angular2/src/facade/promise');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var core_1 = require('angular2/core');
/**
 * Providers for validators to be used for {@link Control}s in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * ### Example
 *
 * {@example core/forms/ts/ng_validators/ng_validators.ts region='ng_validators'}
 */
exports.NG_VALIDATORS = lang_1.CONST_EXPR(new core_1.OpaqueToken("NgValidators"));
/**
 * Providers for asynchronous validators to be used for {@link Control}s
 * in a form.
 *
 * Provide this using `multi: true` to add validators.
 *
 * See {@link NG_VALIDATORS} for more details.
 */
exports.NG_ASYNC_VALIDATORS = lang_1.CONST_EXPR(new core_1.OpaqueToken("NgAsyncValidators"));
/**
 * Provides a set of validators used by form controls.
 *
 * A validator is a function that processes a {@link Control} or collection of
 * controls and returns a map of errors. A null map means that validation has passed.
 *
 * ### Example
 *
 * ```typescript
 * var loginControl = new Control("", Validators.required)
 * ```
 */
var Validators = (function () {
    function Validators() {
    }
    /**
     * Validator that requires controls to have a non-empty value.
     */
    Validators.required = function (control) {
        return lang_1.isBlank(control.value) || (lang_1.isString(control.value) && control.value == "") ?
            { "required": true } :
            null;
    };
    /**
     * Validator that requires controls to have a value of a minimum length.
     */
    Validators.minLength = function (minLength) {
        return function (control) {
            if (lang_1.isPresent(Validators.required(control)))
                return null;
            var v = control.value;
            return v.length < minLength ?
                { "minlength": { "requiredLength": minLength, "actualLength": v.length } } :
                null;
        };
    };
    /**
     * Validator that requires controls to have a value of a maximum length.
     */
    Validators.maxLength = function (maxLength) {
        return function (control) {
            if (lang_1.isPresent(Validators.required(control)))
                return null;
            var v = control.value;
            return v.length > maxLength ?
                { "maxlength": { "requiredLength": maxLength, "actualLength": v.length } } :
                null;
        };
    };
    /**
     * No-op validator.
     */
    Validators.nullValidator = function (c) { return null; };
    /**
     * Compose multiple validators into a single function that returns the union
     * of the individual error maps.
     */
    Validators.compose = function (validators) {
        if (lang_1.isBlank(validators))
            return null;
        var presentValidators = validators.filter(lang_1.isPresent);
        if (presentValidators.length == 0)
            return null;
        return function (control) {
            return _mergeErrors(_executeValidators(control, presentValidators));
        };
    };
    Validators.composeAsync = function (validators) {
        if (lang_1.isBlank(validators))
            return null;
        var presentValidators = validators.filter(lang_1.isPresent);
        if (presentValidators.length == 0)
            return null;
        return function (control) {
            var promises = _executeValidators(control, presentValidators).map(_convertToPromise);
            return promise_1.PromiseWrapper.all(promises).then(_mergeErrors);
        };
    };
    return Validators;
})();
exports.Validators = Validators;
function _convertToPromise(obj) {
    return promise_1.PromiseWrapper.isPromise(obj) ? obj : async_1.ObservableWrapper.toPromise(obj);
}
function _executeValidators(control, validators) {
    return validators.map(function (v) { return v(control); });
}
function _mergeErrors(arrayOfErrors) {
    var res = arrayOfErrors.reduce(function (res, errors) {
        return lang_1.isPresent(errors) ? collection_1.StringMapWrapper.merge(res, errors) : res;
    }, {});
    return collection_1.StringMapWrapper.isEmpty(res) ? null : res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21tb24vZm9ybXMvdmFsaWRhdG9ycy50cyJdLCJuYW1lcyI6WyJWYWxpZGF0b3JzIiwiVmFsaWRhdG9ycy5jb25zdHJ1Y3RvciIsIlZhbGlkYXRvcnMucmVxdWlyZWQiLCJWYWxpZGF0b3JzLm1pbkxlbmd0aCIsIlZhbGlkYXRvcnMubWF4TGVuZ3RoIiwiVmFsaWRhdG9ycy5udWxsVmFsaWRhdG9yIiwiVmFsaWRhdG9ycy5jb21wb3NlIiwiVmFsaWRhdG9ycy5jb21wb3NlQXN5bmMiLCJfY29udmVydFRvUHJvbWlzZSIsIl9leGVjdXRlVmFsaWRhdG9ycyIsIl9tZXJnZUVycm9ycyJdLCJtYXBwaW5ncyI6IkFBQUEscUJBQXVELDBCQUEwQixDQUFDLENBQUE7QUFDbEYsd0JBQTZCLDZCQUE2QixDQUFDLENBQUE7QUFDM0Qsc0JBQWdDLDJCQUEyQixDQUFDLENBQUE7QUFDNUQsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBSTFDOzs7Ozs7OztHQVFHO0FBQ1UscUJBQWEsR0FBZ0IsaUJBQVUsQ0FBQyxJQUFJLGtCQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUV0Rjs7Ozs7OztHQU9HO0FBQ1UsMkJBQW1CLEdBQWdCLGlCQUFVLENBQUMsSUFBSSxrQkFBVyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztBQUVqRzs7Ozs7Ozs7Ozs7R0FXRztBQUNIO0lBQUFBO0lBaUVBQyxDQUFDQTtJQWhFQ0Q7O09BRUdBO0lBQ0lBLG1CQUFRQSxHQUFmQSxVQUFnQkEsT0FBNEJBO1FBQzFDRSxNQUFNQSxDQUFDQSxjQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxPQUFPQSxDQUFDQSxLQUFLQSxJQUFJ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Q0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIGlzUHJlc2VudCwgQ09OU1RfRVhQUiwgaXNTdHJpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuaW1wb3J0IHtPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCAqIGFzIG1vZGVsTW9kdWxlIGZyb20gJy4vbW9kZWwnO1xuXG4vKipcbiAqIFByb3ZpZGVycyBmb3IgdmFsaWRhdG9ycyB0byBiZSB1c2VkIGZvciB7QGxpbmsgQ29udHJvbH1zIGluIGEgZm9ybS5cbiAqXG4gKiBQcm92aWRlIHRoaXMgdXNpbmcgYG11bHRpOiB0cnVlYCB0byBhZGQgdmFsaWRhdG9ycy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL2Zvcm1zL3RzL25nX3ZhbGlkYXRvcnMvbmdfdmFsaWRhdG9ycy50cyByZWdpb249J25nX3ZhbGlkYXRvcnMnfVxuICovXG5leHBvcnQgY29uc3QgTkdfVkFMSURBVE9SUzogT3BhcXVlVG9rZW4gPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbihcIk5nVmFsaWRhdG9yc1wiKSk7XG5cbi8qKlxuICogUHJvdmlkZXJzIGZvciBhc3luY2hyb25vdXMgdmFsaWRhdG9ycyB0byBiZSB1c2VkIGZvciB7QGxpbmsgQ29udHJvbH1zXG4gKiBpbiBhIGZvcm0uXG4gKlxuICogUHJvdmlkZSB0aGlzIHVzaW5nIGBtdWx0aTogdHJ1ZWAgdG8gYWRkIHZhbGlkYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBOR19WQUxJREFUT1JTfSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgY29uc3QgTkdfQVNZTkNfVkFMSURBVE9SUzogT3BhcXVlVG9rZW4gPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbihcIk5nQXN5bmNWYWxpZGF0b3JzXCIpKTtcblxuLyoqXG4gKiBQcm92aWRlcyBhIHNldCBvZiB2YWxpZGF0b3JzIHVzZWQgYnkgZm9ybSBjb250cm9scy5cbiAqXG4gKiBBIHZhbGlkYXRvciBpcyBhIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIGEge0BsaW5rIENvbnRyb2x9IG9yIGNvbGxlY3Rpb24gb2ZcbiAqIGNvbnRyb2xzIGFuZCByZXR1cm5zIGEgbWFwIG9mIGVycm9ycy4gQSBudWxsIG1hcCBtZWFucyB0aGF0IHZhbGlkYXRpb24gaGFzIHBhc3NlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciBsb2dpbkNvbnRyb2wgPSBuZXcgQ29udHJvbChcIlwiLCBWYWxpZGF0b3JzLnJlcXVpcmVkKVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBWYWxpZGF0b3JzIHtcbiAgLyoqXG4gICAqIFZhbGlkYXRvciB0aGF0IHJlcXVpcmVzIGNvbnRyb2xzIHRvIGhhdmUgYSBub24tZW1wdHkgdmFsdWUuXG4gICAqL1xuICBzdGF0aWMgcmVxdWlyZWQoY29udHJvbDogbW9kZWxNb2R1bGUuQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgcmV0dXJuIGlzQmxhbmsoY29udHJvbC52YWx1ZSkgfHwgKGlzU3RyaW5nKGNvbnRyb2wudmFsdWUpICYmIGNvbnRyb2wudmFsdWUgPT0gXCJcIikgP1xuICAgICAgICAgICAgICAge1wicmVxdWlyZWRcIjogdHJ1ZX0gOlxuICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0b3IgdGhhdCByZXF1aXJlcyBjb250cm9scyB0byBoYXZlIGEgdmFsdWUgb2YgYSBtaW5pbXVtIGxlbmd0aC5cbiAgICovXG4gIHN0YXRpYyBtaW5MZW5ndGgobWluTGVuZ3RoOiBudW1iZXIpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIChjb250cm9sOiBtb2RlbE1vZHVsZS5Db250cm9sKToge1trZXk6IHN0cmluZ106IGFueX0gPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudChWYWxpZGF0b3JzLnJlcXVpcmVkKGNvbnRyb2wpKSkgcmV0dXJuIG51bGw7XG4gICAgICB2YXIgdjogc3RyaW5nID0gY29udHJvbC52YWx1ZTtcbiAgICAgIHJldHVybiB2Lmxlbmd0aCA8IG1pbkxlbmd0aCA/XG4gICAgICAgICAgICAgICAgIHtcIm1pbmxlbmd0aFwiOiB7XCJyZXF1aXJlZExlbmd0aFwiOiBtaW5MZW5ndGgsIFwiYWN0dWFsTGVuZ3RoXCI6IHYubGVuZ3RofX0gOlxuICAgICAgICAgICAgICAgICBudWxsO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdG9yIHRoYXQgcmVxdWlyZXMgY29udHJvbHMgdG8gaGF2ZSBhIHZhbHVlIG9mIGEgbWF4aW11bSBsZW5ndGguXG4gICAqL1xuICBzdGF0aWMgbWF4TGVuZ3RoKG1heExlbmd0aDogbnVtYmVyKTogRnVuY3Rpb24ge1xuICAgIHJldHVybiAoY29udHJvbDogbW9kZWxNb2R1bGUuQ29udHJvbCk6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0+IHtcbiAgICAgIGlmIChpc1ByZXNlbnQoVmFsaWRhdG9ycy5yZXF1aXJlZChjb250cm9sKSkpIHJldHVybiBudWxsO1xuICAgICAgdmFyIHY6IHN0cmluZyA9IGNvbnRyb2wudmFsdWU7XG4gICAgICByZXR1cm4gdi5sZW5ndGggPiBtYXhMZW5ndGggP1xuICAgICAgICAgICAgICAgICB7XCJtYXhsZW5ndGhcIjoge1wicmVxdWlyZWRMZW5ndGhcIjogbWF4TGVuZ3RoLCBcImFjdHVhbExlbmd0aFwiOiB2Lmxlbmd0aH19IDpcbiAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE5vLW9wIHZhbGlkYXRvci5cbiAgICovXG4gIHN0YXRpYyBudWxsVmFsaWRhdG9yKGM6IGFueSk6IHtba2V5OiBzdHJpbmddOiBib29sZWFufSB7IHJldHVybiBudWxsOyB9XG5cbiAgLyoqXG4gICAqIENvbXBvc2UgbXVsdGlwbGUgdmFsaWRhdG9ycyBpbnRvIGEgc2luZ2xlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgdW5pb25cbiAgICogb2YgdGhlIGluZGl2aWR1YWwgZXJyb3IgbWFwcy5cbiAgICovXG4gIHN0YXRpYyBjb21wb3NlKHZhbGlkYXRvcnM6IEZ1bmN0aW9uW10pOiBGdW5jdGlvbiB7XG4gICAgaWYgKGlzQmxhbmsodmFsaWRhdG9ycykpIHJldHVybiBudWxsO1xuICAgIHZhciBwcmVzZW50VmFsaWRhdG9ycyA9IHZhbGlkYXRvcnMuZmlsdGVyKGlzUHJlc2VudCk7XG4gICAgaWYgKHByZXNlbnRWYWxpZGF0b3JzLmxlbmd0aCA9PSAwKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbihjb250cm9sOiBtb2RlbE1vZHVsZS5BYnN0cmFjdENvbnRyb2wpIHtcbiAgICAgIHJldHVybiBfbWVyZ2VFcnJvcnMoX2V4ZWN1dGVWYWxpZGF0b3JzKGNvbnRyb2wsIHByZXNlbnRWYWxpZGF0b3JzKSk7XG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBjb21wb3NlQXN5bmModmFsaWRhdG9yczogRnVuY3Rpb25bXSk6IEZ1bmN0aW9uIHtcbiAgICBpZiAoaXNCbGFuayh2YWxpZGF0b3JzKSkgcmV0dXJuIG51bGw7XG4gICAgdmFyIHByZXNlbnRWYWxpZGF0b3JzID0gdmFsaWRhdG9ycy5maWx0ZXIoaXNQcmVzZW50KTtcbiAgICBpZiAocHJlc2VudFZhbGlkYXRvcnMubGVuZ3RoID09IDApIHJldHVybiBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGNvbnRyb2w6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCkge1xuICAgICAgbGV0IHByb21pc2VzID0gX2V4ZWN1dGVWYWxpZGF0b3JzKGNvbnRyb2wsIHByZXNlbnRWYWxpZGF0b3JzKS5tYXAoX2NvbnZlcnRUb1Byb21pc2UpO1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChwcm9taXNlcykudGhlbihfbWVyZ2VFcnJvcnMpO1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NvbnZlcnRUb1Byb21pc2Uob2JqOiBhbnkpOiBhbnkge1xuICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuaXNQcm9taXNlKG9iaikgPyBvYmogOiBPYnNlcnZhYmxlV3JhcHBlci50b1Byb21pc2Uob2JqKTtcbn1cblxuZnVuY3Rpb24gX2V4ZWN1dGVWYWxpZGF0b3JzKGNvbnRyb2w6IG1vZGVsTW9kdWxlLkFic3RyYWN0Q29udHJvbCwgdmFsaWRhdG9yczogRnVuY3Rpb25bXSk6IGFueVtdIHtcbiAgcmV0dXJuIHZhbGlkYXRvcnMubWFwKHYgPT4gdihjb250cm9sKSk7XG59XG5cbmZ1bmN0aW9uIF9tZXJnZUVycm9ycyhhcnJheU9mRXJyb3JzOiBhbnlbXSk6IHtba2V5OiBzdHJpbmddOiBhbnl9IHtcbiAgdmFyIHJlcyA9IGFycmF5T2ZFcnJvcnMucmVkdWNlKChyZXMsIGVycm9ycykgPT4ge1xuICAgIHJldHVybiBpc1ByZXNlbnQoZXJyb3JzKSA/IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UoPGFueT5yZXMsIDxhbnk+ZXJyb3JzKSA6IHJlcztcbiAgfSwge30pO1xuICByZXR1cm4gU3RyaW5nTWFwV3JhcHBlci5pc0VtcHR5KHJlcykgPyBudWxsIDogcmVzO1xufVxuIl19