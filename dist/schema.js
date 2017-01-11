'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    return {
        nonEmptyValue: function nonEmptyValue(schema) {
            return schema.array() || schema.object() || schema.literal();
        },
        value: function value(schema) {
            return schema.nonEmptyValue() || schema.empty();
        },
        object: function object(schema) {
            return schema.parensLeft() && schema.objectValue() && schema.parensRight();
        },
        objectValue: function objectValue(schema) {
            return schema.empty() || schema.strictString() && schema.colon() && schema.value() && (schema.comma() && schema.objectValue() || schema.empty());
        },
        array: function array(schema) {
            return schema.bracketLeft() && schema.arrayValue() && schema.bracketRight();
        },
        arrayValue: function arrayValue(schema) {
            return schema.value() && (schema.comma() && schema.arrayValue() || schema.empty());
        },
        literal: function literal(schema) {
            return schema.integer() || schema.string() || schema.boolean() || schema.null();
        },
        integer: function integer(schema) {
            return '-?[0-9]+(\\.[0-9]*)?(e[0-9]+)?';
        },
        strictString: function strictString(schema) {
            return '"(\\\\"|[^"])*"';
        },
        string: function string(schema) {
            return '"(\\\\(?:[bfnrt\\\\\/"]|u[0-9a-f])|[^"\\\\])*"';
        },
        boolean: function boolean(schema) {
            return 'true|false';
        },
        null: function _null() {
            return 'null';
        },
        parensLeft: function parensLeft() {
            return '{';
        },
        parensRight: function parensRight() {
            return '}';
        },
        bracketLeft: function bracketLeft() {
            return '\\[';
        },
        bracketRight: function bracketRight() {
            return ']';
        },
        comma: function comma() {
            return ',';
        },
        colon: function colon() {
            return ':';
        },
        empty: function empty() {
            return true;
        }
    };
};