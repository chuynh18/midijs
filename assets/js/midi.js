"use strict";

const applicationSettings = {
    maxFileSizeBytes: 5*1024*1024 // maximum file size to parse
}

const midiConstants = {
    MThd: "Header", // MIDI headers start at the magic string "MThd"
    MTrk: "Track", // tracks start at the magic string "MTrk"
    magicStringSize: 4, // magic strings are always 4 bytes
    headerSize: 14 // MIDI headers are 14 bytes
};

/**
 * @param {HTMLInputElement} fileSelector
 * @returns {Promise} Promise that should resolve to an object of MIDI tracks
 */
export default async function getMidi(fileSelector) {
    const file = fileSelector.files[0];
    
    const retVal = await file.arrayBuffer().then(buffer =>
        {
            if (fileSizeExceedsThreshold(file)) {
                throw new Error(`Selected file is ${file.size} bytes which is larger than the threshold of ${applicationSettings.maxFileSizeBytes} bytes.`);
            }

            const dataView = new DataView(buffer);
            const header = parseHeader(dataView);

            if (! header.isMidi) {
                const fileName = file.name;
                const fileSplit = file.name.split(".");
                const fileExtension = fileSplit.length === 1 ? "an unknown type of" : `a ${fileSplit[fileSplit.length - 1]}`;
                throw new Error(`Not a valid MIDI file. ${fileName} is ${fileExtension} file.`);
            }
            
            const tracks = findTracks(dataView, dataView.byteLength);
            
            if (! validateMidi(header, tracks)) {
                return;
            }

            return tracks;
        }
    );

    return retVal;
}

/**
 * Returns an object that is a representation of the tracks of a MIDI file.
 * @param {DataView} dataView 
 * @param {number} dataViewByteLength
 * @returns {object}
 */
function findTracks(dataView, dataViewByteLength) {
    const trackStart = [];
    for (let i = 0; i < dataViewByteLength - 4; i += 1) {
        let magicString = parseBytes(dataView, i, i + midiConstants.magicStringSize);

        if (midiConstants[magicString] === midiConstants.MTrk) {
            trackStart.push({
                metadata: {
                    startingBytes: i + midiConstants.magicStringSize
                }
            });
        }
    }

    for (let i = 0; i < trackStart.length - 1; i++) {
        trackStart[i].metadata.bytesLength = trackStart[i+1].metadata.startingBytes - trackStart[i].metadata.startingBytes;
    }

    if (trackStart.at(-1)) {
        trackStart.at(-1).metadata.bytesLength = dataViewByteLength - trackStart.at(-1).metadata.startingBytes;
    }
    
    return trackStart;
}

// In retrospect, this function is trying to be too clever.
/**
 * Returns an array of numbers representing the bytes of a slice of a DataView.
 * @param {DataView} dataView the DataView of an ArrayBuffer that contains the entire MIDI file
 * @param {number} startingByte starting byte number of the DataView
 * @param {number} endingByte ending byte number
*/
function parseDataViewSegment(dataView, startingByte, endingByte) {
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
function parseBytes(dataView, startingByte, endingByte) {
    return parseDataViewSegment(dataView, startingByte, endingByte)
    .map(byte => String.fromCharCode(byte))
    .join("");
}

/**
 * True if MIDI file starts with valid "MThd" header, false otherwise.
 * @param {DataView} dataView the DataView of an ArrayBuffer that contains the entire MIDI file
*/
function isMidi(dataView) {
    return midiConstants[parseBytes(dataView, 0, midiConstants.magicStringSize)] ? true : false;
}

/**
 * Returns an object representation of the MIDI header
 * @param {DataView} dataView the DataView of an ArrayBuffer that contains the entire MIDI file
*/
function parseHeader(dataView) {
    const bytes = parseDataViewSegment(
        dataView,
        midiConstants.magicStringSize,
        midiConstants.headerSize
    );

    return {
        isMidi: isMidi(dataView),
        format: bytes[5],
        numTracks: bytes[7],
        timing: bytes[9]
    };
}

/**
 * @param {object} header header object returned by parseHeader()
 * @param {object} tracks tracks object returned by findTracks()
*/
function validateMidi(header, tracks) {
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

/**
 * Returns true if input file's size is less than the set threshold
 * @param {File} file A file object from an HTMLInputElement
 * @param {number} sizeThreshold Maximum file size to parse
 */
function fileSizeExceedsThreshold(file, sizeThreshold = applicationSettings.maxFileSizeBytes) {
    return file.size > sizeThreshold;
}