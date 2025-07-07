import { midiConstants } from "./midi-constants.js";
import { trackMetadata } from "./midi-utility-functions.js";

export default function parseTrack(track, trackIndex, midiFormatType) {
    switch(midiFormatType) {
        case 0: return handleFormat0(track); // format 0 only has one track
        case 1: return handleFormat1(track, trackIndex); // multitrack, all music tracks played simultaneously
        case 2: return handleFormat2(track, trackIndex); // multitrack, tracks may be independent
        default: throw new Error(`invalid MIDI format value ${midiFormatType}, must be 0, 1, or 2`);
    }
}

function handleFormat0(track) {
    console.log("TODO: MIDI format 0 currently untested. Let's assume its track is simply a music track.");
    return handleTrack(track);
}

function handleFormat1(track, trackIndex){
    switch(trackIndex) {
        case 0: return handleMetadata(track); // the first track in a format 1 MIDI is metadata
        default: return handleTrack(track);
    }
}

function handleFormat2(track, trackIndex){
    console.log("TODO: MIDI format 2 currently untested.");
    return handleTrack(track);
}

/**
 * 
 * @param {Array} track 
 */
function handleMetadata(track) {
    const parsedTrack = {};
    const tempArr = [];

    for (let i = 0; i < track.length; i++) {
        if (track[i] === midiConstants.trackMetaDataStartingByte) {
            const metaEvent = track[i+1];
            const messageLength = track[i+2];

            if (trackMetadata[metaEvent]) {
                
                if (! trackMetadata[metaEvent].handler) break;

                parsedTrack[metaEvent] = {
                    type: trackMetadata[metaEvent].type,
                    data: trackMetadata[metaEvent].handler(track.slice(i+3, i + messageLength + 2))
                };

                i += messageLength;
            } else {
                parsedTrack[tempArr[0]] = Array.from(tempArr.slice(1));
                tempArr.length = 0;
            }
        } else {
            tempArr.push(track[i]);
        }
    }

    return parsedTrack;
}

function handleTrack(track) {
    const parsedTrack = {
        metadata: {},
        music: []
    };
    
    for (let i = 0; i < track.length; i++) {

    }
}