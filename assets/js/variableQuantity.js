"use strict";
// TODO: convert this to a module and export variableQuantityToValue()

// You will be among the first to foray into the depths of this code. We know not what horrors lurk within.

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
 * 
 * It really sucks how stringly typing binary numbers makes the JS code more concise versus preserving the
 * digits as actual numbers...
 */

/**
 * Converts MIDI variable quantity delta-time to actual value
 * @param {number[]} byteArray Array representing the raw delta-time bytes read from MIDI file
 * @returns {number} Actual delta-time value
 */
function variableQuantityToValue(byteArray) {
    const NUM_BITS_IN_UINT8 = 8; // no shit, Sherlock

    // byte.toString(2) - converts the byte to binary. but it's a string and it might not be 8 chars long
    // leftPad(byte.toString(2), "0", NUM_BITS_IN_UINT8) - now it's 8 chars long. we zero pad to avoid changing the value
    // the substring(1) chops off the first character which is the MSB
    // finally, byteArray.map because we want to do these operations on every single byte
    const test = byteArray.map(byte => leftPad(byte.toString(2), "0", NUM_BITS_IN_UINT8).substring(1));

    // concat the bits then parse the binary number to an int and return it
    // concatenating strings in an array via reduce. my soul hurts so much it doesn't hurt anymore because it ceased to exist
    return parseInt(test.reduce((accumulator, currentValue) => accumulator + currentValue), 2);
}

/**
 * left pad a string with another string. if the string to use as padding is too short,
 * it'll be repeated until it's long enough
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