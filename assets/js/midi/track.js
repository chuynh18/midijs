import { midiConstants } from "./midi-constants.js";

const trackMetadata = {
    0x01: {type: "text", handler: parseText},
    0x02: {type: "copyright", handler: parseText},
    0x03: {type: "sequence/track name", handler: parseText},
    0x04: {type: "instrument", handler: parseText},
    0x05: {type: "lyric", handler: parseText},
    0x06: {type: "marker", handler: parseText},
    0x07: {type: "cue point", handler: parseText}
};

function parseText(array) {
    return array.map(element => String.fromCharCode(element)).join("");
}

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
        case 0: return handleFormat1Track0(track); // the first track in a format 1 MIDI is special
        default: return handleTrack(track);
    }
}

function handleFormat2(track, trackIndex){
    console.log("TODO: MIDI format 2 currently untested.");
    return handleTrack(track);
}

function handleFormat1Track0(track) {
    const parsedTrack = {};
    const tempArr = [];
    let hasSkippedFirst = false;

    for (let i = 0; i < track.length; i++) {
        if (track[i] === midiConstants.trackMetaDataStartingByte) {
            if (hasSkippedFirst) {
                if (trackMetadata[tempArr[0]]) {
                    parsedTrack[tempArr[0]] = {
                        type: trackMetadata[tempArr[0]].type,
                        data: trackMetadata[tempArr[0]].handler(tempArr.slice(2, -1))
                    };
                } else {
                    parsedTrack[tempArr[0]] = Array.from(tempArr.slice(1));
                }
            }
            tempArr.length = 0;
            hasSkippedFirst = true;
        } else {
            tempArr.push(track[i]);
        }
    }

    console.log(parsedTrack);
    return parsedTrack;
}

function handleTrack(track) {

}