'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
var lang_2 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var html_parser_1 = require('./html_parser');
var html_tags_1 = require('./html_tags');
var parse_util_1 = require('./parse_util');
var ast_1 = require('angular2/src/core/change_detection/parser/ast');
var template_ast_1 = require('./template_ast');
var selector_1 = require('angular2/src/compiler/selector');
var element_schema_registry_1 = require('angular2/src/compiler/schema/element_schema_registry');
var template_preparser_1 = require('./template_preparser');
var style_url_resolver_1 = require('./style_url_resolver');
var html_ast_1 = require('./html_ast');
var util_1 = require('./util');
// Group 1 = "bind-"
// Group 2 = "var-" or "#"
// Group 3 = "on-"
// Group 4 = "bindon-"
// Group 5 = the identifier after "bind-", "var-/#", or "on-"
// Group 6 = identifier inside [()]
// Group 7 = identifier inside []
// Group 8 = identifier inside ()
var BIND_NAME_REGEXP = /^(?:(?:(?:(bind-)|(var-|#)|(on-)|(bindon-))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/g;
var TEMPLATE_ELEMENT = 'template';
var TEMPLATE_ATTR = 'template';
var TEMPLATE_ATTR_PREFIX = '*';
var CLASS_ATTR = 'class';
var PROPERTY_PARTS_SEPARATOR = '.';
var ATTRIBUTE_PREFIX = 'attr';
var CLASS_PREFIX = 'class';
var STYLE_PREFIX = 'style';
var TEXT_CSS_SELECTOR = selector_1.CssSelector.parse('*')[0];
/**
 * Provides an array of {@link TemplateAstVisitor}s which will be used to transform
 * parsed templates before compilation is invoked, allowing custom expression syntax
 * and other advanced transformations.
 *
 * This is currently an internal-only feature and not meant for general use.
 */
exports.TEMPLATE_TRANSFORMS = lang_2.CONST_EXPR(new core_1.OpaqueToken('TemplateTransforms'));
var TemplateParseError = (function (_super) {
    __extends(TemplateParseError, _super);
    function TemplateParseError(message, location) {
        _super.call(this, location, message);
    }
    return TemplateParseError;
})(parse_util_1.ParseError);
exports.TemplateParseError = TemplateParseError;
var TemplateParser = (function () {
    function TemplateParser(_exprParser, _schemaRegistry, _htmlParser, transforms) {
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this._htmlParser = _htmlParser;
        this.transforms = transforms;
    }
    TemplateParser.prototype.parse = function (template, directives, pipes, templateUrl) {
        var parseVisitor = new TemplateParseVisitor(directives, pipes, this._exprParser, this._schemaRegistry);
        var htmlAstWithErrors = this._htmlParser.parse(template, templateUrl);
        var result = html_ast_1.htmlVisitAll(parseVisitor, htmlAstWithErrors.rootNodes, EMPTY_COMPONENT);
        var errors = htmlAstWithErrors.errors.concat(parseVisitor.errors);
        if (errors.length > 0) {
            var errorString = errors.join('\n');
            throw new exceptions_1.BaseException("Template parse errors:\n" + errorString);
        }
        if (lang_1.isPresent(this.transforms)) {
            this.transforms.forEach(function (transform) { result = template_ast_1.templateVisitAll(transform, result); });
        }
        return result;
    };
    TemplateParser = __decorate([
        core_1.Injectable(),
        __param(3, core_1.Optional()),
        __param(3, core_1.Inject(exports.TEMPLATE_TRANSFORMS)), 
        __metadata('design:paramtypes', [change_detection_1.Parser, element_schema_registry_1.ElementSchemaRegistry, html_parser_1.HtmlParser, Array])
    ], TemplateParser);
    return TemplateParser;
})();
exports.TemplateParser = TemplateParser;
var TemplateParseVisitor = (function () {
    function TemplateParseVisitor(directives, pipes, _exprParser, _schemaRegistry) {
        var _this = this;
        this._exprParser = _exprParser;
        this._schemaRegistry = _schemaRegistry;
        this.errors = [];
        this.directivesIndex = new Map();
        this.ngContentCount = 0;
        this.selectorMatcher = new selector_1.SelectorMatcher();
        collection_1.ListWrapper.forEachWithIndex(directives, function (directive, index) {
            var selector = selector_1.CssSelector.parse(directive.selector);
            _this.selectorMatcher.addSelectables(selector, directive);
            _this.directivesIndex.set(directive, index);
        });
        this.pipesByName = new Map();
        pipes.forEach(function (pipe) { return _this.pipesByName.set(pipe.name, pipe); });
    }
    TemplateParseVisitor.prototype._reportError = function (message, sourceSpan) {
        this.errors.push(new TemplateParseError(message, sourceSpan.start));
    };
    TemplateParseVisitor.prototype._parseInterpolation = function (value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseInterpolation(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError("" + e, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._parseAction = function (value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseAction(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError("" + e, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._parseBinding = function (value, sourceSpan) {
        var sourceInfo = sourceSpan.start.toString();
        try {
            var ast = this._exprParser.parseBinding(value, sourceInfo);
            this._checkPipes(ast, sourceSpan);
            return ast;
        }
        catch (e) {
            this._reportError("" + e, sourceSpan);
            return this._exprParser.wrapLiteralPrimitive('ERROR', sourceInfo);
        }
    };
    TemplateParseVisitor.prototype._parseTemplateBindings = function (value, sourceSpan) {
        var _this = this;
        var sourceInfo = sourceSpan.start.toString();
        try {
            var bindings = this._exprParser.parseTemplateBindings(value, sourceInfo);
            bindings.forEach(function (binding) {
                if (lang_1.isPresent(binding.expression)) {
                    _this._checkPipes(binding.expression, sourceSpan);
                }
            });
            return bindings;
        }
        catch (e) {
            this._reportError("" + e, sourceSpan);
            return [];
        }
    };
    TemplateParseVisitor.prototype._checkPipes = function (ast, sourceSpan) {
        var _this = this;
        if (lang_1.isPresent(ast)) {
            var collector = new PipeCollector();
            ast.visit(collector);
            collector.pipes.forEach(function (pipeName) {
                if (!_this.pipesByName.has(pipeName)) {
                    _this._reportError("The pipe '" + pipeName + "' could not be found", sourceSpan);
                }
            });
        }
    };
    TemplateParseVisitor.prototype.visitText = function (ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        var expr = this._parseInterpolation(ast.value, ast.sourceSpan);
        if (lang_1.isPresent(expr)) {
            return new template_ast_1.BoundTextAst(expr, ngContentIndex, ast.sourceSpan);
        }
        else {
            return new template_ast_1.TextAst(ast.value, ngContentIndex, ast.sourceSpan);
        }
    };
    TemplateParseVisitor.prototype.visitAttr = function (ast, contex) {
        return new template_ast_1.AttrAst(ast.name, ast.value, ast.sourceSpan);
    };
    TemplateParseVisitor.prototype.visitElement = function (element, component) {
        var _this = this;
        var nodeName = element.name;
        var preparsedElement = template_preparser_1.preparseElement(element);
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
            preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE) {
            // Skipping <script> for security reasons
            // Skipping <style> as we already processed them
            // in the StyleCompiler
            return null;
        }
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET &&
            style_url_resolver_1.isStyleUrlResolvable(preparsedElement.hrefAttr)) {
            // Skipping stylesheets with either relative urls or package scheme as we already processed
            // them in the StyleCompiler
            return null;
        }
        var matchableAttrs = [];
        var elementOrDirectiveProps = [];
        var vars = [];
        var events = [];
        var templateElementOrDirectiveProps = [];
        var templateVars = [];
        var templateMatchableAttrs = [];
        var hasInlineTemplates = false;
        var attrs = [];
        element.attrs.forEach(function (attr) {
            var hasBinding = _this._parseAttr(attr, matchableAttrs, elementOrDirectiveProps, events, vars);
            var hasTemplateBinding = _this._parseInlineTemplateBinding(attr, templateMatchableAttrs, templateElementOrDirectiveProps, templateVars);
            if (!hasBinding && !hasTemplateBinding) {
                // don't include the bindings as attributes as well in the AST
                attrs.push(_this.visitAttr(attr, null));
                matchableAttrs.push([attr.name, attr.value]);
            }
            if (hasTemplateBinding) {
                hasInlineTemplates = true;
            }
        });
        var lcElName = html_tags_1.splitNsName(nodeName.toLowerCase())[1];
        var isTemplateElement = lcElName == TEMPLATE_ELEMENT;
        var elementCssSelector = createElementCssSelector(nodeName, matchableAttrs);
        var directives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, elementCssSelector), elementOrDirectiveProps, isTemplateElement ? [] : vars, element.sourceSpan);
        var elementProps = this._createElementPropertyAsts(element.name, elementOrDirectiveProps, directives);
        var children = html_ast_1.htmlVisitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children, Component.create(directives));
        var elementNgContentIndex = hasInlineTemplates ? null : component.findNgContentIndex(elementCssSelector);
        var parsedElement;
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.NG_CONTENT) {
            if (lang_1.isPresent(element.children) && element.children.length > 0) {
                this._reportError("<ng-content> element cannot have content. <ng-content> must be immediately followed by </ng-content>", element.sourceSpan);
            }
            parsedElement =
                new template_ast_1.NgContentAst(this.ngContentCount++, elementNgContentIndex, element.sourceSpan);
        }
        else if (isTemplateElement) {
            this._assertAllEventsPublishedByDirectives(directives, events);
            this._assertNoComponentsNorElementBindingsOnTemplate(directives, elementProps, element.sourceSpan);
            parsedElement = new template_ast_1.EmbeddedTemplateAst(attrs, events, vars, directives, children, elementNgContentIndex, element.sourceSpan);
        }
        else {
            this._assertOnlyOneComponent(directives, element.sourceSpan);
            var elementExportAsVars = vars.filter(function (varAst) { return varAst.value.length === 0; });
            parsedElement =
                new template_ast_1.ElementAst(nodeName, attrs, elementProps, events, elementExportAsVars, directives, children, elementNgContentIndex, element.sourceSpan);
        }
        if (hasInlineTemplates) {
            var templateCssSelector = createElementCssSelector(TEMPLATE_ELEMENT, templateMatchableAttrs);
            var templateDirectives = this._createDirectiveAsts(element.name, this._parseDirectives(this.selectorMatcher, templateCssSelector), templateElementOrDirectiveProps, [], element.sourceSpan);
            var templateElementProps = this._createElementPropertyAsts(element.name, templateElementOrDirectiveProps, templateDirectives);
            this._assertNoComponentsNorElementBindingsOnTemplate(templateDirectives, templateElementProps, element.sourceSpan);
            parsedElement = new template_ast_1.EmbeddedTemplateAst([], [], templateVars, templateDirectives, [parsedElement], component.findNgContentIndex(templateCssSelector), element.sourceSpan);
        }
        return parsedElement;
    };
    TemplateParseVisitor.prototype._parseInlineTemplateBinding = function (attr, targetMatchableAttrs, targetProps, targetVars) {
        var templateBindingsSource = null;
        if (attr.name == TEMPLATE_ATTR) {
            templateBindingsSource = attr.value;
        }
        else if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
            var key = attr.name.substring(TEMPLATE_ATTR_PREFIX.length); // remove the star
            templateBindingsSource = (attr.value.length == 0) ? key : key + ' ' + attr.value;
        }
        if (lang_1.isPresent(templateBindingsSource)) {
            var bindings = this._parseTemplateBindings(templateBindingsSource, attr.sourceSpan);
            for (var i = 0; i < bindings.length; i++) {
                var binding = bindings[i];
                if (binding.keyIsVar) {
                    targetVars.push(new template_ast_1.VariableAst(binding.key, binding.name, attr.sourceSpan));
                    targetMatchableAttrs.push([binding.key, binding.name]);
                }
                else if (lang_1.isPresent(binding.expression)) {
                    this._parsePropertyAst(binding.key, binding.expression, attr.sourceSpan, targetMatchableAttrs, targetProps);
                }
                else {
                    targetMatchableAttrs.push([binding.key, '']);
                    this._parseLiteralAttr(binding.key, null, attr.sourceSpan, targetProps);
                }
            }
            return true;
        }
        return false;
    };
    TemplateParseVisitor.prototype._parseAttr = function (attr, targetMatchableAttrs, targetProps, targetEvents, targetVars) {
        var attrName = this._normalizeAttributeName(attr.name);
        var attrValue = attr.value;
        var bindParts = lang_1.RegExpWrapper.firstMatch(BIND_NAME_REGEXP, attrName);
        var hasBinding = false;
        if (lang_1.isPresent(bindParts)) {
            hasBinding = true;
            if (lang_1.isPresent(bindParts[1])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (lang_1.isPresent(bindParts[2])) {
                var identifier = bindParts[5];
                this._parseVariable(identifier, attrValue, attr.sourceSpan, targetVars);
            }
            else if (lang_1.isPresent(bindParts[3])) {
                this._parseEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (lang_1.isPresent(bindParts[4])) {
                this._parseProperty(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[5], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (lang_1.isPresent(bindParts[6])) {
                this._parseProperty(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
                this._parseAssignmentEvent(bindParts[6], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
            else if (lang_1.isPresent(bindParts[7])) {
                this._parseProperty(bindParts[7], attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
            }
            else if (lang_1.isPresent(bindParts[8])) {
                this._parseEvent(bindParts[8], attrValue, attr.sourceSpan, targetMatchableAttrs, targetEvents);
            }
        }
        else {
            hasBinding = this._parsePropertyInterpolation(attrName, attrValue, attr.sourceSpan, targetMatchableAttrs, targetProps);
        }
        if (!hasBinding) {
            this._parseLiteralAttr(attrName, attrValue, attr.sourceSpan, targetProps);
        }
        return hasBinding;
    };
    TemplateParseVisitor.prototype._normalizeAttributeName = function (attrName) {
        return attrName.toLowerCase().startsWith('data-') ? attrName.substring(5) : attrName;
    };
    TemplateParseVisitor.prototype._parseVariable = function (identifier, value, sourceSpan, targetVars) {
        if (identifier.indexOf('-') > -1) {
            this._reportError("\"-\" is not allowed in variable names", sourceSpan);
        }
        targetVars.push(new template_ast_1.VariableAst(identifier, value, sourceSpan));
    };
    TemplateParseVisitor.prototype._parseProperty = function (name, expression, sourceSpan, targetMatchableAttrs, targetProps) {
        this._parsePropertyAst(name, this._parseBinding(expression, sourceSpan), sourceSpan, targetMatchableAttrs, targetProps);
    };
    TemplateParseVisitor.prototype._parsePropertyInterpolation = function (name, value, sourceSpan, targetMatchableAttrs, targetProps) {
        var expr = this._parseInterpolation(value, sourceSpan);
        if (lang_1.isPresent(expr)) {
            this._parsePropertyAst(name, expr, sourceSpan, targetMatchableAttrs, targetProps);
            return true;
        }
        return false;
    };
    TemplateParseVisitor.prototype._parsePropertyAst = function (name, ast, sourceSpan, targetMatchableAttrs, targetProps) {
        targetMatchableAttrs.push([name, ast.source]);
        targetProps.push(new BoundElementOrDirectiveProperty(name, ast, false, sourceSpan));
    };
    TemplateParseVisitor.prototype._parseAssignmentEvent = function (name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        this._parseEvent(name + "Change", expression + "=$event", sourceSpan, targetMatchableAttrs, targetEvents);
    };
    TemplateParseVisitor.prototype._parseEvent = function (name, expression, sourceSpan, targetMatchableAttrs, targetEvents) {
        // long format: 'target: eventName'
        var parts = util_1.splitAtColon(name, [null, name]);
        var target = parts[0];
        var eventName = parts[1];
        var ast = this._parseAction(expression, sourceSpan);
        targetMatchableAttrs.push([name, ast.source]);
        targetEvents.push(new template_ast_1.BoundEventAst(eventName, target, ast, sourceSpan));
        // Don't detect directives for event names for now,
        // so don't add the event name to the matchableAttrs
    };
    TemplateParseVisitor.prototype._parseLiteralAttr = function (name, value, sourceSpan, targetProps) {
        targetProps.push(new BoundElementOrDirectiveProperty(name, this._exprParser.wrapLiteralPrimitive(value, ''), true, sourceSpan));
    };
    TemplateParseVisitor.prototype._parseDirectives = function (selectorMatcher, elementCssSelector) {
        var _this = this;
        var directives = [];
        selectorMatcher.match(elementCssSelector, function (selector, directive) { directives.push(directive); });
        // Need to sort the directives so that we get consistent results throughout,
        // as selectorMatcher uses Maps inside.
        // Also need to make components the first directive in the array
        collection_1.ListWrapper.sort(directives, function (dir1, dir2) {
            var dir1Comp = dir1.isComponent;
            var dir2Comp = dir2.isComponent;
            if (dir1Comp && !dir2Comp) {
                return -1;
            }
            else if (!dir1Comp && dir2Comp) {
                return 1;
            }
            else {
                return _this.directivesIndex.get(dir1) - _this.directivesIndex.get(dir2);
            }
        });
        return directives;
    };
    TemplateParseVisitor.prototype._createDirectiveAsts = function (elementName, directives, props, possibleExportAsVars, sourceSpan) {
        var _this = this;
        var matchedVariables = new Set();
        var directiveAsts = directives.map(function (directive) {
            var hostProperties = [];
            var hostEvents = [];
            var directiveProperties = [];
            _this._createDirectiveHostPropertyAsts(elementName, directive.hostProperties, sourceSpan, hostProperties);
            _this._createDirectiveHostEventAsts(directive.hostListeners, sourceSpan, hostEvents);
            _this._createDirectivePropertyAsts(directive.inputs, props, directiveProperties);
            var exportAsVars = [];
            possibleExportAsVars.forEach(function (varAst) {
                if ((varAst.value.length === 0 && directive.isComponent) ||
                    (directive.exportAs == varAst.value)) {
                    exportAsVars.push(varAst);
                    matchedVariables.add(varAst.name);
                }
            });
            return new template_ast_1.DirectiveAst(directive, directiveProperties, hostProperties, hostEvents, exportAsVars, sourceSpan);
        });
        possibleExportAsVars.forEach(function (varAst) {
            if (varAst.value.length > 0 && !collection_1.SetWrapper.has(matchedVariables, varAst.name)) {
                _this._reportError("There is no directive with \"exportAs\" set to \"" + varAst.value + "\"", varAst.sourceSpan);
            }
        });
        return directiveAsts;
    };
    TemplateParseVisitor.prototype._createDirectiveHostPropertyAsts = function (elementName, hostProps, sourceSpan, targetPropertyAsts) {
        var _this = this;
        if (lang_1.isPresent(hostProps)) {
            collection_1.StringMapWrapper.forEach(hostProps, function (expression, propName) {
                var exprAst = _this._parseBinding(expression, sourceSpan);
                targetPropertyAsts.push(_this._createElementPropertyAst(elementName, propName, exprAst, sourceSpan));
            });
        }
    };
    TemplateParseVisitor.prototype._createDirectiveHostEventAsts = function (hostListeners, sourceSpan, targetEventAsts) {
        var _this = this;
        if (lang_1.isPresent(hostListeners)) {
            collection_1.StringMapWrapper.forEach(hostListeners, function (expression, propName) {
                _this._parseEvent(propName, expression, sourceSpan, [], targetEventAsts);
            });
        }
    };
    TemplateParseVisitor.prototype._createDirectivePropertyAsts = function (directiveProperties, boundProps, targetBoundDirectiveProps) {
        if (lang_1.isPresent(directiveProperties)) {
            var boundPropsByName = new Map();
            boundProps.forEach(function (boundProp) {
                var prevValue = boundPropsByName.get(boundProp.name);
                if (lang_1.isBlank(prevValue) || prevValue.isLiteral) {
                    // give [a]="b" a higher precedence than a="b" on the same element
                    boundPropsByName.set(boundProp.name, boundProp);
                }
            });
            collection_1.StringMapWrapper.forEach(directiveProperties, function (elProp, dirProp) {
                var boundProp = boundPropsByName.get(elProp);
                // Bindings are optional, so this binding only needs to be set up if an expression is given.
                if (lang_1.isPresent(boundProp)) {
                    targetBoundDirectiveProps.push(new template_ast_1.BoundDirectivePropertyAst(dirProp, boundProp.name, boundProp.expression, boundProp.sourceSpan));
                }
            });
        }
    };
    TemplateParseVisitor.prototype._createElementPropertyAsts = function (elementName, props, directives) {
        var _this = this;
        var boundElementProps = [];
        var boundDirectivePropsIndex = new Map();
        directives.forEach(function (directive) {
            directive.inputs.forEach(function (prop) {
                boundDirectivePropsIndex.set(prop.templateName, prop);
            });
        });
        props.forEach(function (prop) {
            if (!prop.isLiteral && lang_1.isBlank(boundDirectivePropsIndex.get(prop.name))) {
                boundElementProps.push(_this._createElementPropertyAst(elementName, prop.name, prop.expression, prop.sourceSpan));
            }
        });
        return boundElementProps;
    };
    TemplateParseVisitor.prototype._createElementPropertyAst = function (elementName, name, ast, sourceSpan) {
        var unit = null;
        var bindingType;
        var boundPropertyName;
        var parts = name.split(PROPERTY_PARTS_SEPARATOR);
        if (parts.length === 1) {
            boundPropertyName = this._schemaRegistry.getMappedPropName(parts[0]);
            bindingType = template_ast_1.PropertyBindingType.Property;
            if (!this._schemaRegistry.hasProperty(elementName, boundPropertyName)) {
                this._reportError("Can't bind to '" + boundPropertyName + "' since it isn't a known native property", sourceSpan);
            }
        }
        else {
            if (parts[0] == ATTRIBUTE_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = template_ast_1.PropertyBindingType.Attribute;
            }
            else if (parts[0] == CLASS_PREFIX) {
                boundPropertyName = parts[1];
                bindingType = template_ast_1.PropertyBindingType.Class;
            }
            else if (parts[0] == STYLE_PREFIX) {
                unit = parts.length > 2 ? parts[2] : null;
                boundPropertyName = parts[1];
                bindingType = template_ast_1.PropertyBindingType.Style;
            }
            else {
                this._reportError("Invalid property name '" + name + "'", sourceSpan);
                bindingType = null;
            }
        }
        return new template_ast_1.BoundElementPropertyAst(boundPropertyName, bindingType, ast, unit, sourceSpan);
    };
    TemplateParseVisitor.prototype._findComponentDirectiveNames = function (directives) {
        var componentTypeNames = [];
        directives.forEach(function (directive) {
            var typeName = directive.directive.type.name;
            if (directive.directive.isComponent) {
                componentTypeNames.push(typeName);
            }
        });
        return componentTypeNames;
    };
    TemplateParseVisitor.prototype._assertOnlyOneComponent = function (directives, sourceSpan) {
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 1) {
            this._reportError("More than one component: " + componentTypeNames.join(','), sourceSpan);
        }
    };
    TemplateParseVisitor.prototype._assertNoComponentsNorElementBindingsOnTemplate = function (directives, elementProps, sourceSpan) {
        var _this = this;
        var componentTypeNames = this._findComponentDirectiveNames(directives);
        if (componentTypeNames.length > 0) {
            this._reportError("Components on an embedded template: " + componentTypeNames.join(','), sourceSpan);
        }
        elementProps.forEach(function (prop) {
            _this._reportError("Property binding " + prop.name + " not used by any directive on an embedded template", sourceSpan);
        });
    };
    TemplateParseVisitor.prototype._assertAllEventsPublishedByDirectives = function (directives, events) {
        var _this = this;
        var allDirectiveEvents = new Set();
        directives.forEach(function (directive) {
            collection_1.StringMapWrapper.forEach(directive.directive.outputs, function (eventName, _) { allDirectiveEvents.add(eventName); });
        });
        events.forEach(function (event) {
            if (lang_1.isPresent(event.target) || !collection_1.SetWrapper.has(allDirectiveEvents, event.name)) {
                _this._reportError("Event binding " + event.fullName + " not emitted by any directive on an embedded template", event.sourceSpan);
            }
        });
    };
    return TemplateParseVisitor;
})();
var NonBindableVisitor = (function () {
    function NonBindableVisitor() {
    }
    NonBindableVisitor.prototype.visitElement = function (ast, component) {
        var preparsedElement = template_preparser_1.preparseElement(ast);
        if (preparsedElement.type === template_preparser_1.PreparsedElementType.SCRIPT ||
            preparsedElement.type === template_preparser_1.PreparsedElementType.STYLE ||
            preparsedElement.type === template_preparser_1.PreparsedElementType.STYLESHEET) {
            // Skipping <script> for security reasons
            // Skipping <style> and stylesheets as we already processed them
            // in the StyleCompiler
            return null;
        }
        var attrNameAndValues = ast.attrs.map(function (attrAst) { return [attrAst.name, attrAst.value]; });
        var selector = createElementCssSelector(ast.name, attrNameAndValues);
        var ngContentIndex = component.findNgContentIndex(selector);
        var children = html_ast_1.htmlVisitAll(this, ast.children, EMPTY_COMPONENT);
        return new template_ast_1.ElementAst(ast.name, html_ast_1.htmlVisitAll(this, ast.attrs), [], [], [], [], children, ngContentIndex, ast.sourceSpan);
    };
    NonBindableVisitor.prototype.visitAttr = function (ast, context) {
        return new template_ast_1.AttrAst(ast.name, ast.value, ast.sourceSpan);
    };
    NonBindableVisitor.prototype.visitText = function (ast, component) {
        var ngContentIndex = component.findNgContentIndex(TEXT_CSS_SELECTOR);
        return new template_ast_1.TextAst(ast.value, ngContentIndex, ast.sourceSpan);
    };
    return NonBindableVisitor;
})();
var BoundElementOrDirectiveProperty = (function () {
    function BoundElementOrDirectiveProperty(name, expression, isLiteral, sourceSpan) {
        this.name = name;
        this.expression = expression;
        this.isLiteral = isLiteral;
        this.sourceSpan = sourceSpan;
    }
    return BoundElementOrDirectiveProperty;
})();
function splitClasses(classAttrValue) {
    return lang_1.StringWrapper.split(classAttrValue.trim(), /\s+/g);
}
exports.splitClasses = splitClasses;
var Component = (function () {
    function Component(ngContentIndexMatcher, wildcardNgContentIndex) {
        this.ngContentIndexMatcher = ngContentIndexMatcher;
        this.wildcardNgContentIndex = wildcardNgContentIndex;
    }
    Component.create = function (directives) {
        if (directives.length === 0 || !directives[0].directive.isComponent) {
            return EMPTY_COMPONENT;
        }
        var matcher = new selector_1.SelectorMatcher();
        var ngContentSelectors = directives[0].directive.template.ngContentSelectors;
        var wildcardNgContentIndex = null;
        for (var i = 0; i < ngContentSelectors.length; i++) {
            var selector = ngContentSelectors[i];
            if (lang_1.StringWrapper.equals(selector, '*')) {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(selector_1.CssSelector.parse(ngContentSelectors[i]), i);
            }
        }
        return new Component(matcher, wildcardNgContentIndex);
    };
    Component.prototype.findNgContentIndex = function (selector) {
        var ngContentIndices = [];
        this.ngContentIndexMatcher.match(selector, function (selector, ngContentIndex) { ngContentIndices.push(ngContentIndex); });
        collection_1.ListWrapper.sort(ngContentIndices);
        if (lang_1.isPresent(this.wildcardNgContentIndex)) {
            ngContentIndices.push(this.wildcardNgContentIndex);
        }
        return ngContentIndices.length > 0 ? ngContentIndices[0] : null;
    };
    return Component;
})();
function createElementCssSelector(elementName, matchableAttrs) {
    var cssSelector = new selector_1.CssSelector();
    var elNameNoNs = html_tags_1.splitNsName(elementName)[1];
    cssSelector.setElement(elNameNoNs);
    for (var i = 0; i < matchableAttrs.length; i++) {
        var attrName = matchableAttrs[i][0];
        var attrNameNoNs = html_tags_1.splitNsName(attrName)[1];
        var attrValue = matchableAttrs[i][1];
        cssSelector.addAttribute(attrNameNoNs, attrValue);
        if (attrName.toLowerCase() == CLASS_ATTR) {
            var classes = splitClasses(attrValue);
            classes.forEach(function (className) { return cssSelector.addClassName(className); });
        }
    }
    return cssSelector;
}
var EMPTY_COMPONENT = new Component(new selector_1.SelectorMatcher(), null);
var NON_BINDABLE_VISITOR = new NonBindableVisitor();
var PipeCollector = (function (_super) {
    __extends(PipeCollector, _super);
    function PipeCollector() {
        _super.apply(this, arguments);
        this.pipes = new Set();
    }
    PipeCollector.prototype.visitPipe = function (ast) {
        this.pipes.add(ast.name);
        ast.exp.visit(this);
        this.visitAll(ast.args);
        return null;
    };
    return PipeCollector;
})(ast_1.RecursiveAstVisitor);
exports.PipeCollector = PipeCollector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGVfcGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3RlbXBsYXRlX3BhcnNlci50cyJdLCJuYW1lcyI6WyJUZW1wbGF0ZVBhcnNlRXJyb3IiLCJUZW1wbGF0ZVBhcnNlRXJyb3IuY29uc3RydWN0b3IiLCJUZW1wbGF0ZVBhcnNlciIsIlRlbXBsYXRlUGFyc2VyLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVQYXJzZXIucGFyc2UiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvciIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLmNvbnN0cnVjdG9yIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3JlcG9ydEVycm9yIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlSW50ZXJwb2xhdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUFjdGlvbiIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUJpbmRpbmciLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2NoZWNrUGlwZXMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdFRleHQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdEF0dHIiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci52aXNpdEVsZW1lbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VJbmxpbmVUZW1wbGF0ZUJpbmRpbmciLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VBdHRyIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VWYXJpYWJsZSIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZVByb3BlcnR5IiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlUHJvcGVydHlBc3QiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VBc3NpZ25tZW50RXZlbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fcGFyc2VFdmVudCIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9wYXJzZUxpdGVyYWxBdHRyIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX3BhcnNlRGlyZWN0aXZlcyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVEaXJlY3RpdmVBc3RzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2NyZWF0ZURpcmVjdGl2ZUhvc3RQcm9wZXJ0eUFzdHMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRGlyZWN0aXZlSG9zdEV2ZW50QXN0cyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3QiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fZmluZENvbXBvbmVudERpcmVjdGl2ZU5hbWVzIiwiVGVtcGxhdGVQYXJzZVZpc2l0b3IuX2Fzc2VydE9ubHlPbmVDb21wb25lbnQiLCJUZW1wbGF0ZVBhcnNlVmlzaXRvci5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZSIsIlRlbXBsYXRlUGFyc2VWaXNpdG9yLl9hc3NlcnRBbGxFdmVudHNQdWJsaXNoZWRCeURpcmVjdGl2ZXMiLCJOb25CaW5kYWJsZVZpc2l0b3IiLCJOb25CaW5kYWJsZVZpc2l0b3IuY29uc3RydWN0b3IiLCJOb25CaW5kYWJsZVZpc2l0b3IudmlzaXRFbGVtZW50IiwiTm9uQmluZGFibGVWaXNpdG9yLnZpc2l0QXR0ciIsIk5vbkJpbmRhYmxlVmlzaXRvci52aXNpdFRleHQiLCJCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5IiwiQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eS5jb25zdHJ1Y3RvciIsInNwbGl0Q2xhc3NlcyIsIkNvbXBvbmVudCIsIkNvbXBvbmVudC5jb25zdHJ1Y3RvciIsIkNvbXBvbmVudC5jcmVhdGUiLCJDb21wb25lbnQuZmluZE5nQ29udGVudEluZGV4IiwiY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yIiwiUGlwZUNvbGxlY3RvciIsIlBpcGVDb2xsZWN0b3IuY29uc3RydWN0b3IiLCJQaXBlQ29sbGVjdG9yLnZpc2l0UGlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyQkFBd0QsZ0NBQWdDLENBQUMsQ0FBQTtBQUN6RixxQkFBK0QsMEJBQTBCLENBQUMsQ0FBQTtBQUMxRixxQkFBd0QsZUFBZSxDQUFDLENBQUE7QUFDeEUscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFDcEQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsaUNBQXlDLHFEQUFxRCxDQUFDLENBQUE7QUFHL0YsNEJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBQ3pDLDBCQUEwQixhQUFhLENBQUMsQ0FBQTtBQUN4QywyQkFBeUQsY0FBYyxDQUFDLENBQUE7QUFDeEUsb0JBQStDLCtDQUErQyxDQUFDLENBQUE7QUFHL0YsNkJBZ0JPLGdCQUFnQixDQUFDLENBQUE7QUFDeEIseUJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFFNUUsd0NBQW9DLHNEQUFzRCxDQUFDLENBQUE7QUFDM0YsbUNBQXNFLHNCQUFzQixDQUFDLENBQUE7QUFFN0YsbUNBQW1DLHNCQUFzQixDQUFDLENBQUE7QUFFMUQseUJBT08sWUFBWSxDQUFDLENBQUE7QUFFcEIscUJBQTJCLFFBQVEsQ0FBQyxDQUFBO0FBRXBDLG9CQUFvQjtBQUNwQiwwQkFBMEI7QUFDMUIsa0JBQWtCO0FBQ2xCLHNCQUFzQjtBQUN0Qiw2REFBNkQ7QUFDN0QsbUNBQW1DO0FBQ25DLGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFDakMsSUFB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QVVBLEVBQUVBLG9CQUFvQkEsRUFDOURBLFlBQVlBLENBQUNBLENBQUNBO1lBRTNDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxvQkFBb0JBLEVBQzlEQSxXQUFXQSxDQUFDQSxDQUFDQTtnQkFDakNBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsVUFBVUEsRUFBRUEsb0JBQW9CQSxFQUM5REEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7WUFFM0NBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLG9CQUFvQkEsRUFDOURBLFdBQVdBLENBQUNBLENBQUNBO1lBRW5DQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxvQkFBb0JBLEVBQzlEQSxZQUFZQSxDQUFDQSxDQUFDQTtZ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Q0FBQ0E7QUFDckJBLENBQUNBO0FBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxTQUFTLENBQUMsSUFBSSwwQkFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakUsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFHcEQ7SUFBbUNDLGlDQUFtQkE7SUFBdERBO1FBQW1DQyw4QkFBbUJBO1FBQ3BEQSxVQUFLQSxHQUFnQkEsSUFBSUEsR0FBR0EsRUFBVUEsQ0FBQ0E7SUFPekNBLENBQUNBO0lBTkNELGlDQUFTQSxHQUFUQSxVQUFVQSxHQUFnQkE7UUFDeEJFLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3pCQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBQ0hGLG9CQUFDQTtBQUFEQSxDQUFDQSxBQVJELEVBQW1DLHlCQUFtQixFQVFyRDtBQVJZLHFCQUFhLGdCQVF6QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgU2V0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVnRXhwV3JhcHBlciwgaXNQcmVzZW50LCBTdHJpbmdXcmFwcGVyLCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VuLCBPcHRpb25hbH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BhcnNlciwgQVNULCBBU1RXaXRoU291cmNlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtUZW1wbGF0ZUJpbmRpbmd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vcGFyc2VyL2FzdCc7XG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZVBpcGVNZXRhZGF0YX0gZnJvbSAnLi9kaXJlY3RpdmVfbWV0YWRhdGEnO1xuaW1wb3J0IHtIdG1sUGFyc2VyfSBmcm9tICcuL2h0bWxfcGFyc2VyJztcbmltcG9ydCB7c3BsaXROc05hbWV9IGZyb20gJy4vaHRtbF90YWdzJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFuLCBQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9ufSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtSZWN1cnNpdmVBc3RWaXNpdG9yLCBCaW5kaW5nUGlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wYXJzZXIvYXN0JztcblxuXG5pbXBvcnQge1xuICBFbGVtZW50QXN0LFxuICBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgVmFyaWFibGVBc3QsXG4gIFRlbXBsYXRlQXN0LFxuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIHRlbXBsYXRlVmlzaXRBbGwsXG4gIFRleHRBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgRW1iZWRkZWRUZW1wbGF0ZUFzdCxcbiAgQXR0ckFzdCxcbiAgTmdDb250ZW50QXN0LFxuICBQcm9wZXJ0eUJpbmRpbmdUeXBlLFxuICBEaXJlY3RpdmVBc3QsXG4gIEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3Rcbn0gZnJvbSAnLi90ZW1wbGF0ZV9hc3QnO1xuaW1wb3J0IHtDc3NTZWxlY3RvciwgU2VsZWN0b3JNYXRjaGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvc2VsZWN0b3InO1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge3ByZXBhcnNlRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudCwgUHJlcGFyc2VkRWxlbWVudFR5cGV9IGZyb20gJy4vdGVtcGxhdGVfcHJlcGFyc2VyJztcblxuaW1wb3J0IHtpc1N0eWxlVXJsUmVzb2x2YWJsZX0gZnJvbSAnLi9zdHlsZV91cmxfcmVzb2x2ZXInO1xuXG5pbXBvcnQge1xuICBIdG1sQXN0VmlzaXRvcixcbiAgSHRtbEFzdCxcbiAgSHRtbEVsZW1lbnRBc3QsXG4gIEh0bWxBdHRyQXN0LFxuICBIdG1sVGV4dEFzdCxcbiAgaHRtbFZpc2l0QWxsXG59IGZyb20gJy4vaHRtbF9hc3QnO1xuXG5pbXBvcnQge3NwbGl0QXRDb2xvbn0gZnJvbSAnLi91dGlsJztcblxuLy8gR3JvdXAgMSA9IFwiYmluZC1cIlxuLy8gR3JvdXAgMiA9IFwidmFyLVwiIG9yIFwiI1wiXG4vLyBHcm91cCAzID0gXCJvbi1cIlxuLy8gR3JvdXAgNCA9IFwiYmluZG9uLVwiXG4vLyBHcm91cCA1ID0gdGhlIGlkZW50aWZpZXIgYWZ0ZXIgXCJiaW5kLVwiLCBcInZhci0vI1wiLCBvciBcIm9uLVwiXG4vLyBHcm91cCA2ID0gaWRlbnRpZmllciBpbnNpZGUgWygpXVxuLy8gR3JvdXAgNyA9IGlkZW50aWZpZXIgaW5zaWRlIFtdXG4vLyBHcm91cCA4ID0gaWRlbnRpZmllciBpbnNpZGUgKClcbnZhciBCSU5EX05BTUVfUkVHRVhQID1cbiAgICAvXig/Oig/Oig/OihiaW5kLSl8KHZhci18Iyl8KG9uLSl8KGJpbmRvbi0pKSguKykpfFxcW1xcKChbXlxcKV0rKVxcKVxcXXxcXFsoW15cXF1dKylcXF18XFwoKFteXFwpXSspXFwpKSQvZztcblxuY29uc3QgVEVNUExBVEVfRUxFTUVOVCA9ICd0ZW1wbGF0ZSc7XG5jb25zdCBURU1QTEFURV9BVFRSID0gJ3RlbXBsYXRlJztcbmNvbnN0IFRFTVBMQVRFX0FUVFJfUFJFRklYID0gJyonO1xuY29uc3QgQ0xBU1NfQVRUUiA9ICdjbGFzcyc7XG5cbnZhciBQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IgPSAnLic7XG5jb25zdCBBVFRSSUJVVEVfUFJFRklYID0gJ2F0dHInO1xuY29uc3QgQ0xBU1NfUFJFRklYID0gJ2NsYXNzJztcbmNvbnN0IFNUWUxFX1BSRUZJWCA9ICdzdHlsZSc7XG5cbnZhciBURVhUX0NTU19TRUxFQ1RPUiA9IENzc1NlbGVjdG9yLnBhcnNlKCcqJylbMF07XG5cbi8qKlxuICogUHJvdmlkZXMgYW4gYXJyYXkgb2Yge0BsaW5rIFRlbXBsYXRlQXN0VmlzaXRvcn1zIHdoaWNoIHdpbGwgYmUgdXNlZCB0byB0cmFuc2Zvcm1cbiAqIHBhcnNlZCB0ZW1wbGF0ZXMgYmVmb3JlIGNvbXBpbGF0aW9uIGlzIGludm9rZWQsIGFsbG93aW5nIGN1c3RvbSBleHByZXNzaW9uIHN5bnRheFxuICogYW5kIG90aGVyIGFkdmFuY2VkIHRyYW5zZm9ybWF0aW9ucy5cbiAqXG4gKiBUaGlzIGlzIGN1cnJlbnRseSBhbiBpbnRlcm5hbC1vbmx5IGZlYXR1cmUgYW5kIG5vdCBtZWFudCBmb3IgZ2VuZXJhbCB1c2UuXG4gKi9cbmV4cG9ydCBjb25zdCBURU1QTEFURV9UUkFOU0ZPUk1TID0gQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1RlbXBsYXRlVHJhbnNmb3JtcycpKTtcblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUGFyc2VFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIGxvY2F0aW9uOiBQYXJzZUxvY2F0aW9uKSB7IHN1cGVyKGxvY2F0aW9uLCBtZXNzYWdlKTsgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQYXJzZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9leHByUGFyc2VyOiBQYXJzZXIsIHByaXZhdGUgX3NjaGVtYVJlZ2lzdHJ5OiBFbGVtZW50U2NoZW1hUmVnaXN0cnksXG4gICAgICAgICAgICAgIHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVNUExBVEVfVFJBTlNGT1JNUykgcHVibGljIHRyYW5zZm9ybXM6IFRlbXBsYXRlQXN0VmlzaXRvcltdKSB7fVxuXG4gIHBhcnNlKHRlbXBsYXRlOiBzdHJpbmcsIGRpcmVjdGl2ZXM6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YVtdLCBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdLFxuICAgICAgICB0ZW1wbGF0ZVVybDogc3RyaW5nKTogVGVtcGxhdGVBc3RbXSB7XG4gICAgdmFyIHBhcnNlVmlzaXRvciA9XG4gICAgICAgIG5ldyBUZW1wbGF0ZVBhcnNlVmlzaXRvcihkaXJlY3RpdmVzLCBwaXBlcywgdGhpcy5fZXhwclBhcnNlciwgdGhpcy5fc2NoZW1hUmVnaXN0cnkpO1xuICAgIHZhciBodG1sQXN0V2l0aEVycm9ycyA9IHRoaXMuX2h0bWxQYXJzZXIucGFyc2UodGVtcGxhdGUsIHRlbXBsYXRlVXJsKTtcbiAgICB2YXIgcmVzdWx0ID0gaHRtbFZpc2l0QWxsKHBhcnNlVmlzaXRvciwgaHRtbEFzdFdpdGhFcnJvcnMucm9vdE5vZGVzLCBFTVBUWV9DT01QT05FTlQpO1xuICAgIHZhciBlcnJvcnM6IFBhcnNlRXJyb3JbXSA9IGh0bWxBc3RXaXRoRXJyb3JzLmVycm9ycy5jb25jYXQocGFyc2VWaXNpdG9yLmVycm9ycyk7XG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgZXJyb3JTdHJpbmcgPSBlcnJvcnMuam9pbignXFxuJyk7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVGVtcGxhdGUgcGFyc2UgZXJyb3JzOlxcbiR7ZXJyb3JTdHJpbmd9YCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy50cmFuc2Zvcm1zKSkge1xuICAgICAgdGhpcy50cmFuc2Zvcm1zLmZvckVhY2goXG4gICAgICAgICAgKHRyYW5zZm9ybTogVGVtcGxhdGVBc3RWaXNpdG9yKSA9PiB7IHJlc3VsdCA9IHRlbXBsYXRlVmlzaXRBbGwodHJhbnNmb3JtLCByZXN1bHQpOyB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5jbGFzcyBUZW1wbGF0ZVBhcnNlVmlzaXRvciBpbXBsZW1lbnRzIEh0bWxBc3RWaXNpdG9yIHtcbiAgc2VsZWN0b3JNYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXI7XG4gIGVycm9yczogVGVtcGxhdGVQYXJzZUVycm9yW10gPSBbXTtcbiAgZGlyZWN0aXZlc0luZGV4ID0gbmV3IE1hcDxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIG51bWJlcj4oKTtcbiAgbmdDb250ZW50Q291bnQ6IG51bWJlciA9IDA7XG4gIHBpcGVzQnlOYW1lOiBNYXA8c3RyaW5nLCBDb21waWxlUGlwZU1ldGFkYXRhPjtcblxuICBjb25zdHJ1Y3RvcihkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfZXhwclBhcnNlcjogUGFyc2VyLCBwcml2YXRlIF9zY2hlbWFSZWdpc3RyeTogRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KSB7XG4gICAgdGhpcy5zZWxlY3Rvck1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyKCk7XG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChkaXJlY3RpdmVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGRpcmVjdGl2ZTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IENzc1NlbGVjdG9yLnBhcnNlKGRpcmVjdGl2ZS5zZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JNYXRjaGVyLmFkZFNlbGVjdGFibGVzKHNlbGVjdG9yLCBkaXJlY3RpdmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGl2ZXNJbmRleC5zZXQoZGlyZWN0aXZlLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICB0aGlzLnBpcGVzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIENvbXBpbGVQaXBlTWV0YWRhdGE+KCk7XG4gICAgcGlwZXMuZm9yRWFjaChwaXBlID0+IHRoaXMucGlwZXNCeU5hbWUuc2V0KHBpcGUubmFtZSwgcGlwZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3IobWVzc2FnZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB0aGlzLmVycm9ycy5wdXNoKG5ldyBUZW1wbGF0ZVBhcnNlRXJyb3IobWVzc2FnZSwgc291cmNlU3Bhbi5zdGFydCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IEFTVFdpdGhTb3VyY2Uge1xuICAgIHZhciBzb3VyY2VJbmZvID0gc291cmNlU3Bhbi5zdGFydC50b1N0cmluZygpO1xuICAgIHRyeSB7XG4gICAgICB2YXIgYXN0ID0gdGhpcy5fZXhwclBhcnNlci5wYXJzZUludGVycG9sYXRpb24odmFsdWUsIHNvdXJjZUluZm8pO1xuICAgICAgdGhpcy5fY2hlY2tQaXBlcyhhc3QsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIGFzdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIHRoaXMuX2V4cHJQYXJzZXIud3JhcExpdGVyYWxQcmltaXRpdmUoJ0VSUk9SJywgc291cmNlSW5mbyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VBY3Rpb24odmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKTogQVNUV2l0aFNvdXJjZSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBhc3QgPSB0aGlzLl9leHByUGFyc2VyLnBhcnNlQWN0aW9uKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlQmluZGluZyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBBU1RXaXRoU291cmNlIHtcbiAgICB2YXIgc291cmNlSW5mbyA9IHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKTtcbiAgICB0cnkge1xuICAgICAgdmFyIGFzdCA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VCaW5kaW5nKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIHRoaXMuX2NoZWNrUGlwZXMoYXN0LCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiBhc3Q7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoYCR7ZX1gLCBzb3VyY2VTcGFuKTtcbiAgICAgIHJldHVybiB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKCdFUlJPUicsIHNvdXJjZUluZm8pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVGVtcGxhdGVCaW5kaW5ncyh2YWx1ZTogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBUZW1wbGF0ZUJpbmRpbmdbXSB7XG4gICAgdmFyIHNvdXJjZUluZm8gPSBzb3VyY2VTcGFuLnN0YXJ0LnRvU3RyaW5nKCk7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBiaW5kaW5ncyA9IHRoaXMuX2V4cHJQYXJzZXIucGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHZhbHVlLCBzb3VyY2VJbmZvKTtcbiAgICAgIGJpbmRpbmdzLmZvckVhY2goKGJpbmRpbmcpID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChiaW5kaW5nLmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgdGhpcy5fY2hlY2tQaXBlcyhiaW5kaW5nLmV4cHJlc3Npb24sIHNvdXJjZVNwYW4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBiaW5kaW5ncztcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgJHtlfWAsIHNvdXJjZVNwYW4pO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NoZWNrUGlwZXMoYXN0OiBBU1RXaXRoU291cmNlLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICBpZiAoaXNQcmVzZW50KGFzdCkpIHtcbiAgICAgIHZhciBjb2xsZWN0b3IgPSBuZXcgUGlwZUNvbGxlY3RvcigpO1xuICAgICAgYXN0LnZpc2l0KGNvbGxlY3Rvcik7XG4gICAgICBjb2xsZWN0b3IucGlwZXMuZm9yRWFjaCgocGlwZU5hbWUpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnBpcGVzQnlOYW1lLmhhcyhwaXBlTmFtZSkpIHtcbiAgICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVGhlIHBpcGUgJyR7cGlwZU5hbWV9JyBjb3VsZCBub3QgYmUgZm91bmRgLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIGNvbXBvbmVudDogQ29tcG9uZW50KTogYW55IHtcbiAgICB2YXIgbmdDb250ZW50SW5kZXggPSBjb21wb25lbnQuZmluZE5nQ29udGVudEluZGV4KFRFWFRfQ1NTX1NFTEVDVE9SKTtcbiAgICB2YXIgZXhwciA9IHRoaXMuX3BhcnNlSW50ZXJwb2xhdGlvbihhc3QudmFsdWUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICBpZiAoaXNQcmVzZW50KGV4cHIpKSB7XG4gICAgICByZXR1cm4gbmV3IEJvdW5kVGV4dEFzdChleHByLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFRleHRBc3QoYXN0LnZhbHVlLCBuZ0NvbnRlbnRJbmRleCwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXg6IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIG5ldyBBdHRyQXN0KGFzdC5uYW1lLCBhc3QudmFsdWUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBIdG1sRWxlbWVudEFzdCwgY29tcG9uZW50OiBDb21wb25lbnQpOiBhbnkge1xuICAgIHZhciBub2RlTmFtZSA9IGVsZW1lbnQubmFtZTtcbiAgICB2YXIgcHJlcGFyc2VkRWxlbWVudCA9IHByZXBhcnNlRWxlbWVudChlbGVtZW50KTtcbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TQ1JJUFQgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRSkge1xuICAgICAgLy8gU2tpcHBpbmcgPHNjcmlwdD4gZm9yIHNlY3VyaXR5IHJlYXNvbnNcbiAgICAgIC8vIFNraXBwaW5nIDxzdHlsZT4gYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUICYmXG4gICAgICAgIGlzU3R5bGVVcmxSZXNvbHZhYmxlKHByZXBhcnNlZEVsZW1lbnQuaHJlZkF0dHIpKSB7XG4gICAgICAvLyBTa2lwcGluZyBzdHlsZXNoZWV0cyB3aXRoIGVpdGhlciByZWxhdGl2ZSB1cmxzIG9yIHBhY2thZ2Ugc2NoZW1lIGFzIHdlIGFscmVhZHkgcHJvY2Vzc2VkXG4gICAgICAvLyB0aGVtIGluIHRoZSBTdHlsZUNvbXBpbGVyXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10gPSBbXTtcbiAgICB2YXIgZWxlbWVudE9yRGlyZWN0aXZlUHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSA9IFtdO1xuICAgIHZhciB2YXJzOiBWYXJpYWJsZUFzdFtdID0gW107XG4gICAgdmFyIGV2ZW50czogQm91bmRFdmVudEFzdFtdID0gW107XG5cbiAgICB2YXIgdGVtcGxhdGVFbGVtZW50T3JEaXJlY3RpdmVQcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdID0gW107XG4gICAgdmFyIHRlbXBsYXRlVmFyczogVmFyaWFibGVBc3RbXSA9IFtdO1xuICAgIHZhciB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdID0gW107XG4gICAgdmFyIGhhc0lubGluZVRlbXBsYXRlcyA9IGZhbHNlO1xuICAgIHZhciBhdHRycyA9IFtdO1xuXG4gICAgZWxlbWVudC5hdHRycy5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgdmFyIGhhc0JpbmRpbmcgPSB0aGlzLl9wYXJzZUF0dHIoYXR0ciwgbWF0Y2hhYmxlQXR0cnMsIGVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBldmVudHMsIHZhcnMpO1xuICAgICAgdmFyIGhhc1RlbXBsYXRlQmluZGluZyA9IHRoaXMuX3BhcnNlSW5saW5lVGVtcGxhdGVCaW5kaW5nKFxuICAgICAgICAgIGF0dHIsIHRlbXBsYXRlTWF0Y2hhYmxlQXR0cnMsIHRlbXBsYXRlRWxlbWVudE9yRGlyZWN0aXZlUHJvcHMsIHRlbXBsYXRlVmFycyk7XG4gICAgICBpZiAoIWhhc0JpbmRpbmcgJiYgIWhhc1RlbXBsYXRlQmluZGluZykge1xuICAgICAgICAvLyBkb24ndCBpbmNsdWRlIHRoZSBiaW5kaW5ncyBhcyBhdHRyaWJ1dGVzIGFzIHdlbGwgaW4gdGhlIEFTVFxuICAgICAgICBhdHRycy5wdXNoKHRoaXMudmlzaXRBdHRyKGF0dHIsIG51bGwpKTtcbiAgICAgICAgbWF0Y2hhYmxlQXR0cnMucHVzaChbYXR0ci5uYW1lLCBhdHRyLnZhbHVlXSk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzVGVtcGxhdGVCaW5kaW5nKSB7XG4gICAgICAgIGhhc0lubGluZVRlbXBsYXRlcyA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgbGNFbE5hbWUgPSBzcGxpdE5zTmFtZShub2RlTmFtZS50b0xvd2VyQ2FzZSgpKVsxXTtcbiAgICB2YXIgaXNUZW1wbGF0ZUVsZW1lbnQgPSBsY0VsTmFtZSA9PSBURU1QTEFURV9FTEVNRU5UO1xuICAgIHZhciBlbGVtZW50Q3NzU2VsZWN0b3IgPSBjcmVhdGVFbGVtZW50Q3NzU2VsZWN0b3Iobm9kZU5hbWUsIG1hdGNoYWJsZUF0dHJzKTtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUFzdHMoXG4gICAgICAgIGVsZW1lbnQubmFtZSwgdGhpcy5fcGFyc2VEaXJlY3RpdmVzKHRoaXMuc2VsZWN0b3JNYXRjaGVyLCBlbGVtZW50Q3NzU2VsZWN0b3IpLFxuICAgICAgICBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgaXNUZW1wbGF0ZUVsZW1lbnQgPyBbXSA6IHZhcnMsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgdmFyIGVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9XG4gICAgICAgIHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoZWxlbWVudC5uYW1lLCBlbGVtZW50T3JEaXJlY3RpdmVQcm9wcywgZGlyZWN0aXZlcyk7XG4gICAgdmFyIGNoaWxkcmVuID0gaHRtbFZpc2l0QWxsKHByZXBhcnNlZEVsZW1lbnQubm9uQmluZGFibGUgPyBOT05fQklOREFCTEVfVklTSVRPUiA6IHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hpbGRyZW4sIENvbXBvbmVudC5jcmVhdGUoZGlyZWN0aXZlcykpO1xuICAgIHZhciBlbGVtZW50TmdDb250ZW50SW5kZXggPVxuICAgICAgICBoYXNJbmxpbmVUZW1wbGF0ZXMgPyBudWxsIDogY29tcG9uZW50LmZpbmROZ0NvbnRlbnRJbmRleChlbGVtZW50Q3NzU2VsZWN0b3IpO1xuICAgIHZhciBwYXJzZWRFbGVtZW50O1xuICAgIGlmIChwcmVwYXJzZWRFbGVtZW50LnR5cGUgPT09IFByZXBhcnNlZEVsZW1lbnRUeXBlLk5HX0NPTlRFTlQpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQoZWxlbWVudC5jaGlsZHJlbikgJiYgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYDxuZy1jb250ZW50PiBlbGVtZW50IGNhbm5vdCBoYXZlIGNvbnRlbnQuIDxuZy1jb250ZW50PiBtdXN0IGJlIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IDwvbmctY29udGVudD5gLFxuICAgICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICAgIHBhcnNlZEVsZW1lbnQgPVxuICAgICAgICAgIG5ldyBOZ0NvbnRlbnRBc3QodGhpcy5uZ0NvbnRlbnRDb3VudCsrLCBlbGVtZW50TmdDb250ZW50SW5kZXgsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIGlmIChpc1RlbXBsYXRlRWxlbWVudCkge1xuICAgICAgdGhpcy5fYXNzZXJ0QWxsRXZlbnRzUHVibGlzaGVkQnlEaXJlY3RpdmVzKGRpcmVjdGl2ZXMsIGV2ZW50cyk7XG4gICAgICB0aGlzLl9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKGRpcmVjdGl2ZXMsIGVsZW1lbnRQcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIHBhcnNlZEVsZW1lbnQgPSBuZXcgRW1iZWRkZWRUZW1wbGF0ZUFzdChhdHRycywgZXZlbnRzLCB2YXJzLCBkaXJlY3RpdmVzLCBjaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50TmdDb250ZW50SW5kZXgsIGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlcywgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIHZhciBlbGVtZW50RXhwb3J0QXNWYXJzID0gdmFycy5maWx0ZXIodmFyQXN0ID0+IHZhckFzdC52YWx1ZS5sZW5ndGggPT09IDApO1xuICAgICAgcGFyc2VkRWxlbWVudCA9XG4gICAgICAgICAgbmV3IEVsZW1lbnRBc3Qobm9kZU5hbWUsIGF0dHJzLCBlbGVtZW50UHJvcHMsIGV2ZW50cywgZWxlbWVudEV4cG9ydEFzVmFycywgZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbiwgZWxlbWVudE5nQ29udGVudEluZGV4LCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBpZiAoaGFzSW5saW5lVGVtcGxhdGVzKSB7XG4gICAgICB2YXIgdGVtcGxhdGVDc3NTZWxlY3RvciA9IGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihURU1QTEFURV9FTEVNRU5ULCB0ZW1wbGF0ZU1hdGNoYWJsZUF0dHJzKTtcbiAgICAgIHZhciB0ZW1wbGF0ZURpcmVjdGl2ZXMgPSB0aGlzLl9jcmVhdGVEaXJlY3RpdmVBc3RzKFxuICAgICAgICAgIGVsZW1lbnQubmFtZSwgdGhpcy5fcGFyc2VEaXJlY3RpdmVzKHRoaXMuc2VsZWN0b3JNYXRjaGVyLCB0ZW1wbGF0ZUNzc1NlbGVjdG9yKSxcbiAgICAgICAgICB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCBbXSwgZWxlbWVudC5zb3VyY2VTcGFuKTtcbiAgICAgIHZhciB0ZW1wbGF0ZUVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSA9IHRoaXMuX2NyZWF0ZUVsZW1lbnRQcm9wZXJ0eUFzdHMoXG4gICAgICAgICAgZWxlbWVudC5uYW1lLCB0ZW1wbGF0ZUVsZW1lbnRPckRpcmVjdGl2ZVByb3BzLCB0ZW1wbGF0ZURpcmVjdGl2ZXMpO1xuICAgICAgdGhpcy5fYXNzZXJ0Tm9Db21wb25lbnRzTm9yRWxlbWVudEJpbmRpbmdzT25UZW1wbGF0ZSh0ZW1wbGF0ZURpcmVjdGl2ZXMsIHRlbXBsYXRlRWxlbWVudFByb3BzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgICAgcGFyc2VkRWxlbWVudCA9IG5ldyBFbWJlZGRlZFRlbXBsYXRlQXN0KFxuICAgICAgICAgIFtdLCBbXSwgdGVtcGxhdGVWYXJzLCB0ZW1wbGF0ZURpcmVjdGl2ZXMsIFtwYXJzZWRFbGVtZW50XSxcbiAgICAgICAgICBjb21wb25lbnQuZmluZE5nQ29udGVudEluZGV4KHRlbXBsYXRlQ3NzU2VsZWN0b3IpLCBlbGVtZW50LnNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VkRWxlbWVudDtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlSW5saW5lVGVtcGxhdGVCaW5kaW5nKGF0dHI6IEh0bWxBdHRyQXN0LCB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0VmFyczogVmFyaWFibGVBc3RbXSk6IGJvb2xlYW4ge1xuICAgIHZhciB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gbnVsbDtcbiAgICBpZiAoYXR0ci5uYW1lID09IFRFTVBMQVRFX0FUVFIpIHtcbiAgICAgIHRlbXBsYXRlQmluZGluZ3NTb3VyY2UgPSBhdHRyLnZhbHVlO1xuICAgIH0gZWxzZSBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoVEVNUExBVEVfQVRUUl9QUkVGSVgpKSB7XG4gICAgICB2YXIga2V5ID0gYXR0ci5uYW1lLnN1YnN0cmluZyhURU1QTEFURV9BVFRSX1BSRUZJWC5sZW5ndGgpOyAgLy8gcmVtb3ZlIHRoZSBzdGFyXG4gICAgICB0ZW1wbGF0ZUJpbmRpbmdzU291cmNlID0gKGF0dHIudmFsdWUubGVuZ3RoID09IDApID8ga2V5IDoga2V5ICsgJyAnICsgYXR0ci52YWx1ZTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0ZW1wbGF0ZUJpbmRpbmdzU291cmNlKSkge1xuICAgICAgdmFyIGJpbmRpbmdzID0gdGhpcy5fcGFyc2VUZW1wbGF0ZUJpbmRpbmdzKHRlbXBsYXRlQmluZGluZ3NTb3VyY2UsIGF0dHIuc291cmNlU3Bhbik7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJpbmRpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBiaW5kaW5nID0gYmluZGluZ3NbaV07XG4gICAgICAgIGlmIChiaW5kaW5nLmtleUlzVmFyKSB7XG4gICAgICAgICAgdGFyZ2V0VmFycy5wdXNoKG5ldyBWYXJpYWJsZUFzdChiaW5kaW5nLmtleSwgYmluZGluZy5uYW1lLCBhdHRyLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtiaW5kaW5nLmtleSwgYmluZGluZy5uYW1lXSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KGJpbmRpbmcuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KGJpbmRpbmcua2V5LCBiaW5kaW5nLmV4cHJlc3Npb24sIGF0dHIuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbYmluZGluZy5rZXksICcnXSk7XG4gICAgICAgICAgdGhpcy5fcGFyc2VMaXRlcmFsQXR0cihiaW5kaW5nLmtleSwgbnVsbCwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRQcm9wcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUF0dHIoYXR0cjogSHRtbEF0dHJBc3QsIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSwgdGFyZ2V0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10sXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYXJzOiBWYXJpYWJsZUFzdFtdKTogYm9vbGVhbiB7XG4gICAgdmFyIGF0dHJOYW1lID0gdGhpcy5fbm9ybWFsaXplQXR0cmlidXRlTmFtZShhdHRyLm5hbWUpO1xuICAgIHZhciBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuICAgIHZhciBiaW5kUGFydHMgPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goQklORF9OQU1FX1JFR0VYUCwgYXR0ck5hbWUpO1xuICAgIHZhciBoYXNCaW5kaW5nID0gZmFsc2U7XG4gICAgaWYgKGlzUHJlc2VudChiaW5kUGFydHMpKSB7XG4gICAgICBoYXNCaW5kaW5nID0gdHJ1ZTtcbiAgICAgIGlmIChpc1ByZXNlbnQoYmluZFBhcnRzWzFdKSkgeyAgLy8gbWF0Y2g6IGJpbmQtcHJvcFxuICAgICAgICB0aGlzLl9wYXJzZVByb3BlcnR5KGJpbmRQYXJ0c1s1XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzKTtcblxuICAgICAgfSBlbHNlIGlmIChpc1ByZXNlbnQoXG4gICAgICAgICAgICAgICAgICAgICBiaW5kUGFydHNbMl0pKSB7ICAvLyBtYXRjaDogdmFyLW5hbWUgLyB2YXItbmFtZT1cImlkZW5cIiAvICNuYW1lIC8gI25hbWU9XCJpZGVuXCJcbiAgICAgICAgdmFyIGlkZW50aWZpZXIgPSBiaW5kUGFydHNbNV07XG4gICAgICAgIHRoaXMuX3BhcnNlVmFyaWFibGUoaWRlbnRpZmllciwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldFZhcnMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbM10pKSB7ICAvLyBtYXRjaDogb24tZXZlbnRcbiAgICAgICAgdGhpcy5fcGFyc2VFdmVudChiaW5kUGFydHNbNV0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbNF0pKSB7ICAvLyBtYXRjaDogYmluZG9uLXByb3BcbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eShiaW5kUGFydHNbNV0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzaWdubWVudEV2ZW50KGJpbmRQYXJ0c1s1XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbNl0pKSB7ICAvLyBtYXRjaDogWyhleHByKV1cbiAgICAgICAgdGhpcy5fcGFyc2VQcm9wZXJ0eShiaW5kUGFydHNbNl0sIGF0dHJWYWx1ZSwgYXR0ci5zb3VyY2VTcGFuLCB0YXJnZXRNYXRjaGFibGVBdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wcyk7XG4gICAgICAgIHRoaXMuX3BhcnNlQXNzaWdubWVudEV2ZW50KGJpbmRQYXJ0c1s2XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbN10pKSB7ICAvLyBtYXRjaDogW2V4cHJdXG4gICAgICAgIHRoaXMuX3BhcnNlUHJvcGVydHkoYmluZFBhcnRzWzddLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHMpO1xuXG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChiaW5kUGFydHNbOF0pKSB7ICAvLyBtYXRjaDogKGV2ZW50KVxuICAgICAgICB0aGlzLl9wYXJzZUV2ZW50KGJpbmRQYXJ0c1s4XSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEV2ZW50cyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc0JpbmRpbmcgPSB0aGlzLl9wYXJzZVByb3BlcnR5SW50ZXJwb2xhdGlvbihhdHRyTmFtZSwgYXR0clZhbHVlLCBhdHRyLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgICB9XG4gICAgaWYgKCFoYXNCaW5kaW5nKSB7XG4gICAgICB0aGlzLl9wYXJzZUxpdGVyYWxBdHRyKGF0dHJOYW1lLCBhdHRyVmFsdWUsIGF0dHIuc291cmNlU3BhbiwgdGFyZ2V0UHJvcHMpO1xuICAgIH1cbiAgICByZXR1cm4gaGFzQmluZGluZztcbiAgfVxuXG4gIHByaXZhdGUgX25vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0ck5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGF0dHJOYW1lLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aCgnZGF0YS0nKSA/IGF0dHJOYW1lLnN1YnN0cmluZyg1KSA6IGF0dHJOYW1lO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VWYXJpYWJsZShpZGVudGlmaWVyOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRWYXJzOiBWYXJpYWJsZUFzdFtdKSB7XG4gICAgaWYgKGlkZW50aWZpZXIuaW5kZXhPZignLScpID4gLTEpIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBcIi1cIiBpcyBub3QgYWxsb3dlZCBpbiB2YXJpYWJsZSBuYW1lc2AsIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICB0YXJnZXRWYXJzLnB1c2gobmV3IFZhcmlhYmxlQXN0KGlkZW50aWZpZXIsIHZhbHVlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZVByb3BlcnR5KG5hbWU6IHN0cmluZywgZXhwcmVzc2lvbjogc3RyaW5nLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnM6IHN0cmluZ1tdW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSkge1xuICAgIHRoaXMuX3BhcnNlUHJvcGVydHlBc3QobmFtZSwgdGhpcy5fcGFyc2VCaW5kaW5nKGV4cHJlc3Npb24sIHNvdXJjZVNwYW4pLCBzb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsIHRhcmdldFByb3BzKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUHJvcGVydHlJbnRlcnBvbGF0aW9uKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0UHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSk6IGJvb2xlYW4ge1xuICAgIHZhciBleHByID0gdGhpcy5fcGFyc2VJbnRlcnBvbGF0aW9uKHZhbHVlLCBzb3VyY2VTcGFuKTtcbiAgICBpZiAoaXNQcmVzZW50KGV4cHIpKSB7XG4gICAgICB0aGlzLl9wYXJzZVByb3BlcnR5QXN0KG5hbWUsIGV4cHIsIHNvdXJjZVNwYW4sIHRhcmdldE1hdGNoYWJsZUF0dHJzLCB0YXJnZXRQcm9wcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VQcm9wZXJ0eUFzdChuYW1lOiBzdHJpbmcsIGFzdDogQVNUV2l0aFNvdXJjZSwgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pIHtcbiAgICB0YXJnZXRNYXRjaGFibGVBdHRycy5wdXNoKFtuYW1lLCBhc3Quc291cmNlXSk7XG4gICAgdGFyZ2V0UHJvcHMucHVzaChuZXcgQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eShuYW1lLCBhc3QsIGZhbHNlLCBzb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUFzc2lnbm1lbnRFdmVudChuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRNYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSwgdGFyZ2V0RXZlbnRzOiBCb3VuZEV2ZW50QXN0W10pIHtcbiAgICB0aGlzLl9wYXJzZUV2ZW50KGAke25hbWV9Q2hhbmdlYCwgYCR7ZXhwcmVzc2lvbn09JGV2ZW50YCwgc291cmNlU3BhbiwgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcGFyc2VFdmVudChuYW1lOiBzdHJpbmcsIGV4cHJlc3Npb246IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE1hdGNoYWJsZUF0dHJzOiBzdHJpbmdbXVtdLCB0YXJnZXRFdmVudHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIC8vIGxvbmcgZm9ybWF0OiAndGFyZ2V0OiBldmVudE5hbWUnXG4gICAgdmFyIHBhcnRzID0gc3BsaXRBdENvbG9uKG5hbWUsIFtudWxsLCBuYW1lXSk7XG4gICAgdmFyIHRhcmdldCA9IHBhcnRzWzBdO1xuICAgIHZhciBldmVudE5hbWUgPSBwYXJ0c1sxXTtcbiAgICB2YXIgYXN0ID0gdGhpcy5fcGFyc2VBY3Rpb24oZXhwcmVzc2lvbiwgc291cmNlU3Bhbik7XG4gICAgdGFyZ2V0TWF0Y2hhYmxlQXR0cnMucHVzaChbbmFtZSwgYXN0LnNvdXJjZV0pO1xuICAgIHRhcmdldEV2ZW50cy5wdXNoKG5ldyBCb3VuZEV2ZW50QXN0KGV2ZW50TmFtZSwgdGFyZ2V0LCBhc3QsIHNvdXJjZVNwYW4pKTtcbiAgICAvLyBEb24ndCBkZXRlY3QgZGlyZWN0aXZlcyBmb3IgZXZlbnQgbmFtZXMgZm9yIG5vdyxcbiAgICAvLyBzbyBkb24ndCBhZGQgdGhlIGV2ZW50IG5hbWUgdG8gdGhlIG1hdGNoYWJsZUF0dHJzXG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUxpdGVyYWxBdHRyKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10pIHtcbiAgICB0YXJnZXRQcm9wcy5wdXNoKG5ldyBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5KFxuICAgICAgICBuYW1lLCB0aGlzLl9leHByUGFyc2VyLndyYXBMaXRlcmFsUHJpbWl0aXZlKHZhbHVlLCAnJyksIHRydWUsIHNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRGlyZWN0aXZlcyhzZWxlY3Rvck1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRDc3NTZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSB7XG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBbXTtcbiAgICBzZWxlY3Rvck1hdGNoZXIubWF0Y2goZWxlbWVudENzc1NlbGVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAoc2VsZWN0b3IsIGRpcmVjdGl2ZSkgPT4geyBkaXJlY3RpdmVzLnB1c2goZGlyZWN0aXZlKTsgfSk7XG4gICAgLy8gTmVlZCB0byBzb3J0IHRoZSBkaXJlY3RpdmVzIHNvIHRoYXQgd2UgZ2V0IGNvbnNpc3RlbnQgcmVzdWx0cyB0aHJvdWdob3V0LFxuICAgIC8vIGFzIHNlbGVjdG9yTWF0Y2hlciB1c2VzIE1hcHMgaW5zaWRlLlxuICAgIC8vIEFsc28gbmVlZCB0byBtYWtlIGNvbXBvbmVudHMgdGhlIGZpcnN0IGRpcmVjdGl2ZSBpbiB0aGUgYXJyYXlcbiAgICBMaXN0V3JhcHBlci5zb3J0KGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAoZGlyMTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBkaXIyOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcjFDb21wID0gZGlyMS5pc0NvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpcjJDb21wID0gZGlyMi5pc0NvbXBvbmVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpcjFDb21wICYmICFkaXIyQ29tcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghZGlyMUNvbXAgJiYgZGlyMkNvbXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3RpdmVzSW5kZXguZ2V0KGRpcjEpIC0gdGhpcy5kaXJlY3RpdmVzSW5kZXguZ2V0KGRpcjIpO1xuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICByZXR1cm4gZGlyZWN0aXZlcztcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZURpcmVjdGl2ZUFzdHMoZWxlbWVudE5hbWU6IHN0cmluZywgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZUV4cG9ydEFzVmFyczogVmFyaWFibGVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBEaXJlY3RpdmVBc3RbXSB7XG4gICAgdmFyIG1hdGNoZWRWYXJpYWJsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICB2YXIgZGlyZWN0aXZlQXN0cyA9IGRpcmVjdGl2ZXMubWFwKChkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSkgPT4ge1xuICAgICAgdmFyIGhvc3RQcm9wZXJ0aWVzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICB2YXIgaG9zdEV2ZW50czogQm91bmRFdmVudEFzdFtdID0gW107XG4gICAgICB2YXIgZGlyZWN0aXZlUHJvcGVydGllczogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgICB0aGlzLl9jcmVhdGVEaXJlY3RpdmVIb3N0UHJvcGVydHlBc3RzKGVsZW1lbnROYW1lLCBkaXJlY3RpdmUuaG9zdFByb3BlcnRpZXMsIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RQcm9wZXJ0aWVzKTtcbiAgICAgIHRoaXMuX2NyZWF0ZURpcmVjdGl2ZUhvc3RFdmVudEFzdHMoZGlyZWN0aXZlLmhvc3RMaXN0ZW5lcnMsIHNvdXJjZVNwYW4sIGhvc3RFdmVudHMpO1xuICAgICAgdGhpcy5fY3JlYXRlRGlyZWN0aXZlUHJvcGVydHlBc3RzKGRpcmVjdGl2ZS5pbnB1dHMsIHByb3BzLCBkaXJlY3RpdmVQcm9wZXJ0aWVzKTtcbiAgICAgIHZhciBleHBvcnRBc1ZhcnMgPSBbXTtcbiAgICAgIHBvc3NpYmxlRXhwb3J0QXNWYXJzLmZvckVhY2goKHZhckFzdCkgPT4ge1xuICAgICAgICBpZiAoKHZhckFzdC52YWx1ZS5sZW5ndGggPT09IDAgJiYgZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB8fFxuICAgICAgICAgICAgKGRpcmVjdGl2ZS5leHBvcnRBcyA9PSB2YXJBc3QudmFsdWUpKSB7XG4gICAgICAgICAgZXhwb3J0QXNWYXJzLnB1c2godmFyQXN0KTtcbiAgICAgICAgICBtYXRjaGVkVmFyaWFibGVzLmFkZCh2YXJBc3QubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVBc3QoZGlyZWN0aXZlLCBkaXJlY3RpdmVQcm9wZXJ0aWVzLCBob3N0UHJvcGVydGllcywgaG9zdEV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cG9ydEFzVmFycywgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gICAgcG9zc2libGVFeHBvcnRBc1ZhcnMuZm9yRWFjaCgodmFyQXN0KSA9PiB7XG4gICAgICBpZiAodmFyQXN0LnZhbHVlLmxlbmd0aCA+IDAgJiYgIVNldFdyYXBwZXIuaGFzKG1hdGNoZWRWYXJpYWJsZXMsIHZhckFzdC5uYW1lKSkge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgVGhlcmUgaXMgbm8gZGlyZWN0aXZlIHdpdGggXCJleHBvcnRBc1wiIHNldCB0byBcIiR7dmFyQXN0LnZhbHVlfVwiYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyQXN0LnNvdXJjZVNwYW4pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkaXJlY3RpdmVBc3RzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRGlyZWN0aXZlSG9zdFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBob3N0UHJvcHM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQcm9wZXJ0eUFzdHM6IEJvdW5kRWxlbWVudFByb3BlcnR5QXN0W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KGhvc3RQcm9wcykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0UHJvcHMsIChleHByZXNzaW9uLCBwcm9wTmFtZSkgPT4ge1xuICAgICAgICB2YXIgZXhwckFzdCA9IHRoaXMuX3BhcnNlQmluZGluZyhleHByZXNzaW9uLCBzb3VyY2VTcGFuKTtcbiAgICAgICAgdGFyZ2V0UHJvcGVydHlBc3RzLnB1c2goXG4gICAgICAgICAgICB0aGlzLl9jcmVhdGVFbGVtZW50UHJvcGVydHlBc3QoZWxlbWVudE5hbWUsIHByb3BOYW1lLCBleHByQXN0LCBzb3VyY2VTcGFuKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVIb3N0RXZlbnRBc3RzKGhvc3RMaXN0ZW5lcnM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRFdmVudEFzdHM6IEJvdW5kRXZlbnRBc3RbXSkge1xuICAgIGlmIChpc1ByZXNlbnQoaG9zdExpc3RlbmVycykpIHtcbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChob3N0TGlzdGVuZXJzLCAoZXhwcmVzc2lvbiwgcHJvcE5hbWUpID0+IHtcbiAgICAgICAgdGhpcy5fcGFyc2VFdmVudChwcm9wTmFtZSwgZXhwcmVzc2lvbiwgc291cmNlU3BhbiwgW10sIHRhcmdldEV2ZW50QXN0cyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVEaXJlY3RpdmVQcm9wZXJ0eUFzdHMoZGlyZWN0aXZlUHJvcGVydGllczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3VuZFByb3BzOiBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzOiBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KGRpcmVjdGl2ZVByb3BlcnRpZXMpKSB7XG4gICAgICB2YXIgYm91bmRQcm9wc0J5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5PigpO1xuICAgICAgYm91bmRQcm9wcy5mb3JFYWNoKGJvdW5kUHJvcCA9PiB7XG4gICAgICAgIHZhciBwcmV2VmFsdWUgPSBib3VuZFByb3BzQnlOYW1lLmdldChib3VuZFByb3AubmFtZSk7XG4gICAgICAgIGlmIChpc0JsYW5rKHByZXZWYWx1ZSkgfHwgcHJldlZhbHVlLmlzTGl0ZXJhbCkge1xuICAgICAgICAgIC8vIGdpdmUgW2FdPVwiYlwiIGEgaGlnaGVyIHByZWNlZGVuY2UgdGhhbiBhPVwiYlwiIG9uIHRoZSBzYW1lIGVsZW1lbnRcbiAgICAgICAgICBib3VuZFByb3BzQnlOYW1lLnNldChib3VuZFByb3AubmFtZSwgYm91bmRQcm9wKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChkaXJlY3RpdmVQcm9wZXJ0aWVzLCAoZWxQcm9wOiBzdHJpbmcsIGRpclByb3A6IHN0cmluZykgPT4ge1xuICAgICAgICB2YXIgYm91bmRQcm9wID0gYm91bmRQcm9wc0J5TmFtZS5nZXQoZWxQcm9wKTtcblxuICAgICAgICAvLyBCaW5kaW5ncyBhcmUgb3B0aW9uYWwsIHNvIHRoaXMgYmluZGluZyBvbmx5IG5lZWRzIHRvIGJlIHNldCB1cCBpZiBhbiBleHByZXNzaW9uIGlzIGdpdmVuLlxuICAgICAgICBpZiAoaXNQcmVzZW50KGJvdW5kUHJvcCkpIHtcbiAgICAgICAgICB0YXJnZXRCb3VuZERpcmVjdGl2ZVByb3BzLnB1c2gobmV3IEJvdW5kRGlyZWN0aXZlUHJvcGVydHlBc3QoXG4gICAgICAgICAgICAgIGRpclByb3AsIGJvdW5kUHJvcC5uYW1lLCBib3VuZFByb3AuZXhwcmVzc2lvbiwgYm91bmRQcm9wLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0cyhlbGVtZW50TmFtZTogc3RyaW5nLCBwcm9wczogQm91bmRFbGVtZW50T3JEaXJlY3RpdmVQcm9wZXJ0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSB7XG4gICAgdmFyIGJvdW5kRWxlbWVudFByb3BzOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdFtdID0gW107XG4gICAgdmFyIGJvdW5kRGlyZWN0aXZlUHJvcHNJbmRleCA9IG5ldyBNYXA8c3RyaW5nLCBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0PigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaCgoZGlyZWN0aXZlOiBEaXJlY3RpdmVBc3QpID0+IHtcbiAgICAgIGRpcmVjdGl2ZS5pbnB1dHMuZm9yRWFjaCgocHJvcDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCkgPT4ge1xuICAgICAgICBib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguc2V0KHByb3AudGVtcGxhdGVOYW1lLCBwcm9wKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHByb3BzLmZvckVhY2goKHByb3A6IEJvdW5kRWxlbWVudE9yRGlyZWN0aXZlUHJvcGVydHkpID0+IHtcbiAgICAgIGlmICghcHJvcC5pc0xpdGVyYWwgJiYgaXNCbGFuayhib3VuZERpcmVjdGl2ZVByb3BzSW5kZXguZ2V0KHByb3AubmFtZSkpKSB7XG4gICAgICAgIGJvdW5kRWxlbWVudFByb3BzLnB1c2godGhpcy5fY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lLCBwcm9wLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3AuZXhwcmVzc2lvbiwgcHJvcC5zb3VyY2VTcGFuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGJvdW5kRWxlbWVudFByb3BzO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRWxlbWVudFByb3BlcnR5QXN0KGVsZW1lbnROYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgYXN0OiBBU1QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCB7XG4gICAgdmFyIHVuaXQgPSBudWxsO1xuICAgIHZhciBiaW5kaW5nVHlwZTtcbiAgICB2YXIgYm91bmRQcm9wZXJ0eU5hbWU7XG4gICAgdmFyIHBhcnRzID0gbmFtZS5zcGxpdChQUk9QRVJUWV9QQVJUU19TRVBBUkFUT1IpO1xuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gdGhpcy5fc2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUocGFydHNbMF0pO1xuICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLlByb3BlcnR5O1xuICAgICAgaWYgKCF0aGlzLl9zY2hlbWFSZWdpc3RyeS5oYXNQcm9wZXJ0eShlbGVtZW50TmFtZSwgYm91bmRQcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYENhbid0IGJpbmQgdG8gJyR7Ym91bmRQcm9wZXJ0eU5hbWV9JyBzaW5jZSBpdCBpc24ndCBhIGtub3duIG5hdGl2ZSBwcm9wZXJ0eWAsXG4gICAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBhcnRzWzBdID09IEFUVFJJQlVURV9QUkVGSVgpIHtcbiAgICAgICAgYm91bmRQcm9wZXJ0eU5hbWUgPSBwYXJ0c1sxXTtcbiAgICAgICAgYmluZGluZ1R5cGUgPSBQcm9wZXJ0eUJpbmRpbmdUeXBlLkF0dHJpYnV0ZTtcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gQ0xBU1NfUFJFRklYKSB7XG4gICAgICAgIGJvdW5kUHJvcGVydHlOYW1lID0gcGFydHNbMV07XG4gICAgICAgIGJpbmRpbmdUeXBlID0gUHJvcGVydHlCaW5kaW5nVHlwZS5DbGFzcztcbiAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT0gU1RZTEVfUFJFRklYKSB7XG4gICAgICAgIHVuaXQgPSBwYXJ0cy5sZW5ndGggPiAyID8gcGFydHNbMl0gOiBudWxsO1xuICAgICAgICBib3VuZFByb3BlcnR5TmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IFByb3BlcnR5QmluZGluZ1R5cGUuU3R5bGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZXBvcnRFcnJvcihgSW52YWxpZCBwcm9wZXJ0eSBuYW1lICcke25hbWV9J2AsIHNvdXJjZVNwYW4pO1xuICAgICAgICBiaW5kaW5nVHlwZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdChib3VuZFByb3BlcnR5TmFtZSwgYmluZGluZ1R5cGUsIGFzdCwgdW5pdCwgc291cmNlU3Bhbik7XG4gIH1cblxuXG4gIHByaXZhdGUgX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSk6IHN0cmluZ1tdIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgdmFyIHR5cGVOYW1lID0gZGlyZWN0aXZlLmRpcmVjdGl2ZS50eXBlLm5hbWU7XG4gICAgICBpZiAoZGlyZWN0aXZlLmRpcmVjdGl2ZS5pc0NvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnRUeXBlTmFtZXMucHVzaCh0eXBlTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBvbmVudFR5cGVOYW1lcztcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydE9ubHlPbmVDb21wb25lbnQoZGlyZWN0aXZlczogRGlyZWN0aXZlQXN0W10sIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIHZhciBjb21wb25lbnRUeXBlTmFtZXMgPSB0aGlzLl9maW5kQ29tcG9uZW50RGlyZWN0aXZlTmFtZXMoZGlyZWN0aXZlcyk7XG4gICAgaWYgKGNvbXBvbmVudFR5cGVOYW1lcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aGlzLl9yZXBvcnRFcnJvcihgTW9yZSB0aGFuIG9uZSBjb21wb25lbnQ6ICR7Y29tcG9uZW50VHlwZU5hbWVzLmpvaW4oJywnKX1gLCBzb3VyY2VTcGFuKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnROb0NvbXBvbmVudHNOb3JFbGVtZW50QmluZGluZ3NPblRlbXBsYXRlKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnRQcm9wczogQm91bmRFbGVtZW50UHJvcGVydHlBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHtcbiAgICB2YXIgY29tcG9uZW50VHlwZU5hbWVzOiBzdHJpbmdbXSA9IHRoaXMuX2ZpbmRDb21wb25lbnREaXJlY3RpdmVOYW1lcyhkaXJlY3RpdmVzKTtcbiAgICBpZiAoY29tcG9uZW50VHlwZU5hbWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGBDb21wb25lbnRzIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlOiAke2NvbXBvbmVudFR5cGVOYW1lcy5qb2luKCcsJyl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW4pO1xuICAgIH1cbiAgICBlbGVtZW50UHJvcHMuZm9yRWFjaChwcm9wID0+IHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgIGBQcm9wZXJ0eSBiaW5kaW5nICR7cHJvcC5uYW1lfSBub3QgdXNlZCBieSBhbnkgZGlyZWN0aXZlIG9uIGFuIGVtYmVkZGVkIHRlbXBsYXRlYCxcbiAgICAgICAgICBzb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2VydEFsbEV2ZW50c1B1Ymxpc2hlZEJ5RGlyZWN0aXZlcyhkaXJlY3RpdmVzOiBEaXJlY3RpdmVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50czogQm91bmRFdmVudEFzdFtdKSB7XG4gICAgdmFyIGFsbERpcmVjdGl2ZUV2ZW50cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGRpcmVjdGl2ZXMuZm9yRWFjaChkaXJlY3RpdmUgPT4ge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZS5kaXJlY3RpdmUub3V0cHV0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXZlbnROYW1lLCBfKSA9PiB7IGFsbERpcmVjdGl2ZUV2ZW50cy5hZGQoZXZlbnROYW1lKTsgfSk7XG4gICAgfSk7XG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgaWYgKGlzUHJlc2VudChldmVudC50YXJnZXQpIHx8ICFTZXRXcmFwcGVyLmhhcyhhbGxEaXJlY3RpdmVFdmVudHMsIGV2ZW50Lm5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgYEV2ZW50IGJpbmRpbmcgJHtldmVudC5mdWxsTmFtZX0gbm90IGVtaXR0ZWQgYnkgYW55IGRpcmVjdGl2ZSBvbiBhbiBlbWJlZGRlZCB0ZW1wbGF0ZWAsXG4gICAgICAgICAgICBldmVudC5zb3VyY2VTcGFuKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5jbGFzcyBOb25CaW5kYWJsZVZpc2l0b3IgaW1wbGVtZW50cyBIdG1sQXN0VmlzaXRvciB7XG4gIHZpc2l0RWxlbWVudChhc3Q6IEh0bWxFbGVtZW50QXN0LCBjb21wb25lbnQ6IENvbXBvbmVudCk6IEVsZW1lbnRBc3Qge1xuICAgIHZhciBwcmVwYXJzZWRFbGVtZW50ID0gcHJlcGFyc2VFbGVtZW50KGFzdCk7XG4gICAgaWYgKHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU0NSSVBUIHx8XG4gICAgICAgIHByZXBhcnNlZEVsZW1lbnQudHlwZSA9PT0gUHJlcGFyc2VkRWxlbWVudFR5cGUuU1RZTEUgfHxcbiAgICAgICAgcHJlcGFyc2VkRWxlbWVudC50eXBlID09PSBQcmVwYXJzZWRFbGVtZW50VHlwZS5TVFlMRVNIRUVUKSB7XG4gICAgICAvLyBTa2lwcGluZyA8c2NyaXB0PiBmb3Igc2VjdXJpdHkgcmVhc29uc1xuICAgICAgLy8gU2tpcHBpbmcgPHN0eWxlPiBhbmQgc3R5bGVzaGVldHMgYXMgd2UgYWxyZWFkeSBwcm9jZXNzZWQgdGhlbVxuICAgICAgLy8gaW4gdGhlIFN0eWxlQ29tcGlsZXJcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBhdHRyTmFtZUFuZFZhbHVlcyA9IGFzdC5hdHRycy5tYXAoYXR0ckFzdCA9PiBbYXR0ckFzdC5uYW1lLCBhdHRyQXN0LnZhbHVlXSk7XG4gICAgdmFyIHNlbGVjdG9yID0gY3JlYXRlRWxlbWVudENzc1NlbGVjdG9yKGFzdC5uYW1lLCBhdHRyTmFtZUFuZFZhbHVlcyk7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gY29tcG9uZW50LmZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3Rvcik7XG4gICAgdmFyIGNoaWxkcmVuID0gaHRtbFZpc2l0QWxsKHRoaXMsIGFzdC5jaGlsZHJlbiwgRU1QVFlfQ09NUE9ORU5UKTtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRBc3QoYXN0Lm5hbWUsIGh0bWxWaXNpdEFsbCh0aGlzLCBhc3QuYXR0cnMpLCBbXSwgW10sIFtdLCBbXSwgY2hpbGRyZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5nQ29udGVudEluZGV4LCBhc3Quc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXRBdHRyKGFzdDogSHRtbEF0dHJBc3QsIGNvbnRleHQ6IGFueSk6IEF0dHJBc3Qge1xuICAgIHJldHVybiBuZXcgQXR0ckFzdChhc3QubmFtZSwgYXN0LnZhbHVlLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cbiAgdmlzaXRUZXh0KGFzdDogSHRtbFRleHRBc3QsIGNvbXBvbmVudDogQ29tcG9uZW50KTogVGV4dEFzdCB7XG4gICAgdmFyIG5nQ29udGVudEluZGV4ID0gY29tcG9uZW50LmZpbmROZ0NvbnRlbnRJbmRleChURVhUX0NTU19TRUxFQ1RPUik7XG4gICAgcmV0dXJuIG5ldyBUZXh0QXN0KGFzdC52YWx1ZSwgbmdDb250ZW50SW5kZXgsIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxufVxuXG5jbGFzcyBCb3VuZEVsZW1lbnRPckRpcmVjdGl2ZVByb3BlcnR5IHtcbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGV4cHJlc3Npb246IEFTVCwgcHVibGljIGlzTGl0ZXJhbDogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0Q2xhc3NlcyhjbGFzc0F0dHJWYWx1ZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5zcGxpdChjbGFzc0F0dHJWYWx1ZS50cmltKCksIC9cXHMrL2cpO1xufVxuXG5jbGFzcyBDb21wb25lbnQge1xuICBzdGF0aWMgY3JlYXRlKGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUFzdFtdKTogQ29tcG9uZW50IHtcbiAgICBpZiAoZGlyZWN0aXZlcy5sZW5ndGggPT09IDAgfHwgIWRpcmVjdGl2ZXNbMF0uZGlyZWN0aXZlLmlzQ29tcG9uZW50KSB7XG4gICAgICByZXR1cm4gRU1QVFlfQ09NUE9ORU5UO1xuICAgIH1cbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBTZWxlY3Rvck1hdGNoZXIoKTtcbiAgICB2YXIgbmdDb250ZW50U2VsZWN0b3JzID0gZGlyZWN0aXZlc1swXS5kaXJlY3RpdmUudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzO1xuICAgIHZhciB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gbnVsbDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKHNlbGVjdG9yLCAnKicpKSB7XG4gICAgICAgIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWF0Y2hlci5hZGRTZWxlY3RhYmxlcyhDc3NTZWxlY3Rvci5wYXJzZShuZ0NvbnRlbnRTZWxlY3RvcnNbaV0pLCBpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnQobWF0Y2hlciwgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gIH1cbiAgY29uc3RydWN0b3IocHVibGljIG5nQ29udGVudEluZGV4TWF0Y2hlcjogU2VsZWN0b3JNYXRjaGVyLFxuICAgICAgICAgICAgICBwdWJsaWMgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyKSB7fVxuXG4gIGZpbmROZ0NvbnRlbnRJbmRleChzZWxlY3RvcjogQ3NzU2VsZWN0b3IpOiBudW1iZXIge1xuICAgIHZhciBuZ0NvbnRlbnRJbmRpY2VzID0gW107XG4gICAgdGhpcy5uZ0NvbnRlbnRJbmRleE1hdGNoZXIubWF0Y2goXG4gICAgICAgIHNlbGVjdG9yLCAoc2VsZWN0b3IsIG5nQ29udGVudEluZGV4KSA9PiB7IG5nQ29udGVudEluZGljZXMucHVzaChuZ0NvbnRlbnRJbmRleCk7IH0pO1xuICAgIExpc3RXcmFwcGVyLnNvcnQobmdDb250ZW50SW5kaWNlcyk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLndpbGRjYXJkTmdDb250ZW50SW5kZXgpKSB7XG4gICAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2godGhpcy53aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID4gMCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDc3NTZWxlY3RvcihlbGVtZW50TmFtZTogc3RyaW5nLCBtYXRjaGFibGVBdHRyczogc3RyaW5nW11bXSk6IENzc1NlbGVjdG9yIHtcbiAgdmFyIGNzc1NlbGVjdG9yID0gbmV3IENzc1NlbGVjdG9yKCk7XG4gIGxldCBlbE5hbWVOb05zID0gc3BsaXROc05hbWUoZWxlbWVudE5hbWUpWzFdO1xuXG4gIGNzc1NlbGVjdG9yLnNldEVsZW1lbnQoZWxOYW1lTm9Ocyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXRjaGFibGVBdHRycy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhdHRyTmFtZSA9IG1hdGNoYWJsZUF0dHJzW2ldWzBdO1xuICAgIGxldCBhdHRyTmFtZU5vTnMgPSBzcGxpdE5zTmFtZShhdHRyTmFtZSlbMV07XG4gICAgbGV0IGF0dHJWYWx1ZSA9IG1hdGNoYWJsZUF0dHJzW2ldWzFdO1xuXG4gICAgY3NzU2VsZWN0b3IuYWRkQXR0cmlidXRlKGF0dHJOYW1lTm9OcywgYXR0clZhbHVlKTtcbiAgICBpZiAoYXR0ck5hbWUudG9Mb3dlckNhc2UoKSA9PSBDTEFTU19BVFRSKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IHNwbGl0Q2xhc3NlcyhhdHRyVmFsdWUpO1xuICAgICAgY2xhc3Nlcy5mb3JFYWNoKGNsYXNzTmFtZSA9PiBjc3NTZWxlY3Rvci5hZGRDbGFzc05hbWUoY2xhc3NOYW1lKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjc3NTZWxlY3Rvcjtcbn1cblxudmFyIEVNUFRZX0NPTVBPTkVOVCA9IG5ldyBDb21wb25lbnQobmV3IFNlbGVjdG9yTWF0Y2hlcigpLCBudWxsKTtcbnZhciBOT05fQklOREFCTEVfVklTSVRPUiA9IG5ldyBOb25CaW5kYWJsZVZpc2l0b3IoKTtcblxuXG5leHBvcnQgY2xhc3MgUGlwZUNvbGxlY3RvciBleHRlbmRzIFJlY3Vyc2l2ZUFzdFZpc2l0b3Ige1xuICBwaXBlczogU2V0PHN0cmluZz4gPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgdmlzaXRQaXBlKGFzdDogQmluZGluZ1BpcGUpOiBhbnkge1xuICAgIHRoaXMucGlwZXMuYWRkKGFzdC5uYW1lKTtcbiAgICBhc3QuZXhwLnZpc2l0KHRoaXMpO1xuICAgIHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=