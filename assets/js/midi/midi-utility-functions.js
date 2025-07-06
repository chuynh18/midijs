import { midiConstants } from "./midi-constants.js";

/**
 * True if MIDI file starts with valid "MThd" header, false otherwise.
 * @param {DataView} dataView the DataView of an ArrayBuffer that contains the entire MIDI file
*/
export function isMidi(dataView) {
    return midiConstants[parseBytes(dataView, 0, midiConstants.magicStringSize)] ? true : false;
}

// In retrospect, this function is trying to be too clever. Should instead create DataViews when needed.
/**
 * Returns an array of numbers representing the bytes of a slice of a DataView.
 * @param {DataView} dataView the DataView of an ArrayBuffer that contains the entire MIDI file
 * @param {number} startingByte starting byte number of the DataView
 * @param {number} endingByte ending byte number
*/
export function parseDataViewSegment(dataView, startingByte, endingByte) {
    const bytes = [];

    for (let i = startingByte; i < endingByte; i++) {
        bytes.push(dataView.getUint8(i));
    }

    return bytes;
}

/**
 * Returns a string from a slice of a DataView. The slice is determined by startingByte and endingByte.
 * @param {DataView} dataView the DataView of an ArrayBuffer that contains the entire MIDI file
 * @param {number} startingByte starting byte number of the DataView
 * @param {number} endingByte ending byte number
*/
export function parseBytes(dataView, startingByte, endingByte) {
    return parseDataViewSegment(dataView, startingByte, endingByte)
    .map(byte => String.fromCharCode(byte))
    .join("");
}

/**
 * @param {object} header header object returned by parseHeader()
 * @param {object} tracks tracks object returned by findTracks()
*/
export function validateMidi(header, tracks) {
    if (header.numTracks != tracks.length) {
        console.log(`Track mismatch: MIDI header declared ${header.numTracks} tracks but found ${tracks.length} tracks.`);
        return false;
    };
    if (header.format < 0 || header.format > 2) {
        console.log(`Invalid header format. Got ${header.format} but must be 0, 1, or 2`);
        return false;
    }
    return true;
}

// Division bit 15 is 1 if it's an SMTPE timing, 0 if it's ticks per quarter note
// bits 14 through 8 can hold the values: -24, -25, -29, -30
// the absolute value of those represents the framerate
// bits 7 through 0: number of delta-time units per SMTPE frame
/**
 * @param {number} division 
 * @returns {number} SMPTE timing converted to ticks per second
 */
export function handleSmtpe(division) {
    const smtpe = {isSmtpe: false};

    if ((division >> 15) & 1) {
        smtpe.isSmtpe = true;

        // high is originally a 7 bit integer and it is negative. how was it originally stored?
        // do we have to mask bit 7 off?
        // Or did bit 8 serve to make high negative AND signify an SMTPE timing? if so do we have to mask bit 8 off?
        const high = (division >> 8) | 0b10000000_00000000_00000000_00000000;

        const low = division & 0b00000000_11111111;

        smtpe.division = Math.abs(high) * low;
    }

    return smtpe;
}