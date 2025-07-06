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

}

function handleTrack(track) {

}