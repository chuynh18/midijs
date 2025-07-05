"use strict";
// TODO: convert this to a module and export variableQuantityToValue()

// You will be among the first to foray into the depths of this code. We know not what horrors lurk within.

/*
 * MIDI was introduced in 1983, slightly predating the 720 KB and 1.44 MB floppy disk formats. Therefore
 * storage was a major consideration for the designers of the MIDI format. They chose to encode certain
 * values with variable lengths to save space. This makes the logic to parse MIDI tracks more involved.
 * 
 * The delta-time value ranges from 0x00000000 to 0x0FFFFFFF. However, rather than always using 4 bytes
 * to encode each delta-time value, only the necessary number of bytes are used. This is done by only
 * using 7 of the 8 bits per byte and setting the most significant bit (MSB) of all bytes other than the
 * very last one to 1. That is to say, the encoded delta-time can range from 1 to 4 bytes in length and
 * you know you're looking at the last byte when the MSB of that byte is 0.
 * 
 * To convert the delta-time representation to its actual value:
 * - variableQuantityToValue() takes in an array of numbers representing the decimal value of each byte
 * - transform each byte into its binary representation
 * - remove the MSB from each byte then concat the bytes; this is the delta-time value in binary!
 * - convert the above binary number to a decimal and return it
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
    const NUM_BITS_IN_UINT8 = 8; // no shit, Sherlock

    if (number < 0 || number > 255) {
        // this should never happen because we'll only ever feed in Uint8s from the MIDI file
        // because midi.js is explicitly specifying dataView.getUint8()
        throw new Error(`number ${number} is out of bounds, must be between 0 and 255 inclusive.`);
    }

    const numberArray = decimalToBinary(number);
    return Array(NUM_BITS_IN_UINT8 - numberArray.length).fill(0) // create padding array of 0s
        .concat(numberArray);
}

// sweet liberty can't liberate with this broken language
/**
 * Naive function that will convert numbers of any size and will only use as many digits as necessary.
 * @param {Number} number decimal number that you want to convert
 * @returns {Array.<Number>} return number in base 2 but since JS no likey base 2 this is an array of 1s and 0s
 */
function decimalToBinary(number) {
    return Array.from(number.toString(2)) // number in base 2 but it's an array and the 1s and 0s are strings *moan*
        .map(digit => Number(digit));
}
