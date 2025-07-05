"use strict";
// TODO: convert this to a module and export variableQuantityToValue()
// TODO: explain wtf variableQuantityToValue() is doing

// Brutal. I hate it.
function variableQuantityToValue(byteArray) {
    const byteArrayBinary = byteArray.map(byte => Uint8DecimalToBinary(byte));
    const flatByteArrayBinaryRemoveMsbFromEach = byteArrayBinary.flatMap(byte => byte.slice(1));
    const padded = Array(byteArrayBinary.length).fill(0).concat(flatByteArrayBinaryRemoveMsbFromEach);
    const unflattened = unflattenUint8Array(padded);
    return unflattened.map(byteArray => parseInt(byteArray.join(""), 2));
}

/**
 * Converts number to binary, enforces Uint8
 * @param {Number} number decimal number that you want to convert
 * @returns {Array.<Number>} array representing number in binary
 */
function Uint8DecimalToBinary(number) {
    const NUM_BYTES_IN_UINT8 = 8;

    if (number < 0 || number > 255) {
        throw new Error(`number ${number} is out of bounds, must be between 0 and 255 inclusive.`);
    }

    const numberArray = decimalToBinary(number);
    return Array(NUM_BYTES_IN_UINT8 - numberArray.length).fill(0) // create padding array of 0s
        .concat(numberArray);
}

// Sweet liberty, javascript! can't liberate with this broken language
/**
 * Naive function that will convert numbers of any size and will only use as many digits as necessary.
 * @param {Number} number decimal number that you want to convert
 * @returns {Array.<Number>} array representing number in binary
 */
function decimalToBinary(number) {
    return Array
        .from(number.toString(2)) // convert Number to binary (represented as a String) and turn the string into an array
        .map(digit => Number(digit)); // turn each digit from a 1 char String back into a Number
}

function unflattenUint8Array(flatArray) {
    const result = [];
    const byte = [];

    for (let i = 0; i < flatArray.length; i++) {
        byte.push(flatArray[i]);
        if (byte.length === 8) {
            result.push(Array.from(byte));
            byte.length = 0;
        }
    }

    return result;
}