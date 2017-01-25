export default () => ({
    nonEmptyValue: (schema) => schema.array() || schema.object() || schema.literal(),
    value: (schema) => schema.nonEmptyValue() ||schema. empty(),
    object: (schema) => schema.parensLeft() && schema.objectValue() && schema.parensRight(),
    //objectValue: (schema) => schema.empty() || (schema.strictString() && schema.colon() && schema.value() && ((schema.comma() && schema.objectValue()) || schema.empty())),
    objectValue: (schema) => (schema.strictString() && schema.colon() && schema.value() && ((schema.comma() && schema.objectValue())|| schema.empty())) || schema.empty(),
    array: (schema) => schema.bracketLeft() && schema.arrayValue() && schema.bracketRight(),
    arrayValue: (schema) => schema.value() && ((schema.comma() && schema.arrayValue()) || schema.empty()),
    literal: (schema) => {return (schema.integer() || schema.string() || schema.boolean() || schema.null())},
    integer: (schema) => '-?[0-9]+(\\.[0-9]*)?(e[0-9]+)?',
    strictString: (schema) => '"(\\\\"|[^"])*"',
    string: (schema) => '"(\\\\(?:[bfnrt\\\\\/"]|u[0-9a-f])|[^"\\\\])*"',
    boolean: (schema) => 'true|false',
    null: () => 'null',
    parensLeft: () => '{',
    parensRight: () => '}',
    bracketLeft: () => '\\[',
    bracketRight: () => ']',
    comma: () => ',',
    colon: () => ':',
    empty: () => true,
});

/* () => ({
    liquid: schema => schema.doubleBraceOpen() && schema.transformationFunctions() && schema.doubleBraceClose(),
    doubleBraceOpen: () => '{{',
    doubleBraceClose: () => '}}',
    transformationFunctions: schema => schema.repeat((rawNode, repeatCount = 1) => {
        let result = '';

        for (let ii = 0; ii < repeatCount; ii++) {
            result += schema.repeatableValue(rawNode);
        }

        return result;
    }),
    repeat: () => 'repeat\\(([0-9]+)\\)',
    nonEmptyValue: (schema) => schema.array() || schema.object() || schema.literal(),
    ...
}); */
