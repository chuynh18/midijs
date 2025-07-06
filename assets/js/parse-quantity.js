"use strict";

// You will be among the first to foray into the depths of this code. We know not what horrors lurk within.
// Stringly-typing numbers seems to be the best way to work with non-decimal numbers in JavaScript... sigh

/*
 * MIDI was introduced in 1983, slightly predating the 3.5" 720 KB and 1.44 MB floppy disk formats. Storage
 * was therefore a major consideration for the designers of the MIDI format. They chose to encode certain
 * values with variable lengths to save space. This makes the logic to parse MIDI tracks more involved.
 * 
 * The delta-time value ranges from 0x00000000 to 0x0FFFFFFF. However, rather than always using 4 bytes
 * to encode each delta-time value, only the necessary number of bytes are used. This is done by only
 * using 7 of the 8 bits per byte and setting the most significant bit (MSB) of all bytes other than the
 * very last one to 1. That is to say, the encoded delta-time can range from 1 to 4 bytes in length and
 * you know you're looking at the last byte when the MSB of that byte is 0.
 */

/**
 * Converts MIDI variable quantity delta-time to actual value
 * @param {number[]} byteArray Array representing the raw delta-time bytes read from MIDI file
 * @param {boolean} isVariableQuantity true if byteArray represents a MIDI variable quantity,
 * otherwise false if byteArray represents a Uint32. Defaults to true.
 * @returns {number} Actual delta-time value
 */
const NUM_BITS_IN_A_BYTE = 8; // no shit, Sherlock

export default function parseQuantity(byteArray, isVariableQuantity = true) {
    const bitsToShift = isVariableQuantity ? 7 : 8;
    console.log(`twiddle: ${twiddle(byteArray, bitsToShift)}`);

    // converts each byte to binary, left pads each byte with 0s if necessary to make them 8 bits
    let byteArrayBinary = byteArray.map(byte => leftPad(byte.toString(2), "0", NUM_BITS_IN_A_BYTE));

    if (isVariableQuantity) byteArrayBinary = byteArrayBinary.map(byte => byte.substring(1)); // maybe choppity chop the MSB

    // concat the bits then parse the binary number to an int and return it (this is a string concatenation via reduce)
    console.log(`parseInt: ${parseInt(byteArrayBinary.reduce((accumulator, currentValue) => accumulator + currentValue), 2)}`);
    
    return twiddle(byteArray, bitsToShift);
}

/**
 * left pad inputString with padString. if the string to use as padding is too short,
 * repeat it until it is long enough
 * @param {string} inputString string to be left-padded
 * @param {string} padString string to repeat and use as the padding
 * @param {Number} desiredLength desired length of output string
 */
function leftPad(inputString, padString, desiredLength) {
    let padding = padString;
    const padLength = desiredLength - inputString.length;
    while (padding.length < padLength) {
        padding += padString;
    }

    return padding.substring(0, padLength) + inputString;
}

/**
 * Concatenates bytes together
 * @param {[number]} byteArray the byte array to concatenate
 * @param {number} bits number of bits to shift by. 7 bits for encoded delta time, 8 for a normal concatenation
 */
function twiddle(byteArray, bitsToShift) {
    let result = 0;
    const mask = calculateMask(bitsToShift);
    let hasSkippedFirstBitShift = false;

    for (let i = 0; i < byteArray.length; i++) {
        // this is because we want to skip leading zero values but not trailing zero values
        // why would we get leading zero values? when parsing track length because those are always 4 bytes long
        // why would we get trailing zero values? when parsing encode delta-time values
        if (! byteArray[i] && ! hasSkippedFirstBitShift) continue;

        // don't shift the first iteration otherwise 1 byte delta-times will be incorrect
        if (hasSkippedFirstBitShift) result <<= bitsToShift;
        hasSkippedFirstBitShift = true;

        result |= byteArray[i] & mask;
    }

    return result;
}

/**
 * Returns a bitmask starting from the least significant bits.
 * bitsToMaskOn  base10  base2
 * 0             0       00000000
 * 1             1       00000001
 * 2             3       00000011
 * 3             7       00000111
 * 4             15      00001111
 * 5             31      00011111
 * 6             63      00111111
 * 7             127     01111111
 * 8             255     11111111
 * @param {number} bitsToMaskOn how many bits to mask
 * @returns {number} an 8-bit bitmask starting from the LSB
 */
function calculateMask(bitsToMaskOn) {
    if (bitsToMaskOn < 0 || bitsToMaskOn > 8) throw new Error("bitsToMaskOn must be between 0 and 8 inclusive");
    return Math.pow(2, bitsToMaskOn) - 1;
}