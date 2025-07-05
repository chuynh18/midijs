"use strict";
// TODO: convert this to a module and export variableQuantityToValue()

/*
 * MIDI was introduced in 1983, slightly predating the 720 KB and 1.44 MB floppy disk formats. Therefore
 * storage was a major consideration for the designers of the MIDI format. They chose to encode certain
 * values with variable lengths to save space. This makes the logic to parse MIDI tracks more involved.
 * 
 * The delta-time value ranges from 0x00000000 to 0x0FFFFFFF. However, rather than always using 4 bytes
 * to encode each delta-time value, only the necessary number of bytes are used. This is done by only
 * using 7 of the 8 bits per byte and setting the MSB of all bytes other than the very last one to 1.
 * 
 * To convert the delta-time representation to its actual value:
 * - variableQuantityToValue() takes in an array of numbers representing the decimal value of each byte
 * - transform each byte into its binary representation
 * - strip the most significant bit from each byte and concatenate the result; this is the value in binary!
 * - return the decimal representation of the binary number derived in the previous step
 */

/**
 * Converts MIDI variable quantity delta-time to actual value
 * @param {number[]} byteArray Array representing the raw delta-time bytes read from MIDI file
 * @returns {number} Actual delta-time value
 */
function variableQuantityToValue(byteArray) {
    const byteArrayBinary = byteArray.map(byte => Uint8DecimalToBinary(byte));
    const flatByteArrayBinaryRemoveMsbFromEach = byteArrayBinary.flatMap(byte => byte.slice(1));
    return parseInt(flatByteArrayBinaryRemoveMsbFromEach.join(""), 2);
}

/**
 * Converts number to binary, enforces Uint8
 * @param {Number} number decimal number that you want to convert
 * @returns {number[]} array representing number in binary
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
