import { midiConstants } from "./midi-constants.js";
import { trackMetadata, midiMessage } from "./midi-utility-functions.js";
import parseVaribleLengthValue from "./parse-quantity.js";

/**
 * 
 * @param {Array} track 
 */
export default function parseTrack(track) {
    const tempArr = [];
    const parsedTrack = {
        music: []
    };

    for (let i = 0; i < track.length; i++) {
        // handle metadata event
        if (track[i] === midiConstants.trackMetaDataStartingByte && trackMetadata[track[i+1]]) {
            const metaEvent = track[i+1];
            const messageLength = track[i+2];

            if (trackMetadata[metaEvent]) {
                
                // intentional null handler for midi track end event
                if (! trackMetadata[metaEvent].handler) {
                    console.log("encountered track end at index", i);
                    break
                }; 

                parsedTrack[metaEvent] = {
                    type: trackMetadata[metaEvent].type,

                    // skip 3 bytes: first byte is 0xFF, 2nd is the metadata type, 3rd is the message length
                    data: trackMetadata[metaEvent].handler(track.slice(i+3, i + messageLength + 3))
                };

                i += messageLength;
            } else {
                parsedTrack[tempArr[0]] = Array.from(tempArr.slice(1)); // TODO: probably dead or at least invalid code
            }

        tempArr.length = 0;

        } else if (track[i] < 128) { // encountered delta-time stamp, process it and then handle the following midi event
            const timeArray = tempArr.concat(track[i]);
            tempArr.length = 0;
            const time = parseVaribleLengthValue(timeArray);
            const potentialMidiMessage = track[i+1] >> 4;
            let message;
            
            // check next byte for midi event
            if (midiMessage[potentialMidiMessage]) {
                message = {
                    type: midiMessage[potentialMidiMessage].type,
                    typeBinary: track[i+1].toString(2),
                    data: Array.from(track.slice(potentialMidiMessage + 1, potentialMidiMessage + 1 + midiMessage[potentialMidiMessage].dataBytes))
                };
            
                const midiEvent = {
                    time: time,
                    message: message,
                    index: i+1
                };

                parsedTrack.music.push(midiEvent);
                i += midiMessage[potentialMidiMessage].dataBytes + 1;
            }
            
        } else { // don't yet know what this data is, temporarily store it as we might find out what it is later
            tempArr.push(track[i]);
        }
    }

    return parsedTrack;
}
