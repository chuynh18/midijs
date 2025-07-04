"use strict";

const midiConstants = {
    MThd: "Header",
    MTrk: "Track",
    magicStringSize: 4,
    headerSize: 14
};

const fileInput = document.getElementById("midi");

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    const arrayBuffer = file.arrayBuffer().then(buffer =>
        {
            const headerDataView = new DataView(buffer, 0, 14);
            const header = parseHeader(headerDataView);

            if (! header.isMidi) {
                console.log("Not a valid MIDI file.");
                return;
            }
            
            const dataView = new DataView(buffer);
            const tracks = findTracks(buffer, dataView.byteLength);
            
            if (! validateMidi(header, tracks)) {
                return;
            }

            console.log(tracks);
        }
    );
});

function findTracks(buffer, dataViewByteLength) {
    const trackStart = [];
    for (let i = 0; i < dataViewByteLength - 4; i += 1) {
        const tempDataView = new DataView(buffer, i, 4);
        let magicString = parseBytes(tempDataView, tempDataView.byteLength);

        if (midiConstants[magicString] === midiConstants.MTrk) {
            trackStart.push({
                trackStartIndex: i + midiConstants.magicStringSize
            });
        }
    }

    for (let i = 0; i < trackStart.length - 1; i++) {
        trackStart[i].trackLength = trackStart[i+1].trackStartIndex - trackStart[i].trackStartIndex;
    }

    if (trackStart.at(-1)) {
        trackStart.at(-1).trackLength = dataViewByteLength - trackStart.at(-1).trackStartIndex;
    }
    
    return trackStart;
}

function parseDataViewSegment(dataView, startingByte, endingByte) {
    const bytes = [];

    for (let i = startingByte; i < endingByte; i++) {
        bytes.push(dataView.getUint8(i));
    }

    return bytes;
}

function parseBytes(dataView, length) {
    let magicString = "";
    const bytes = parseDataViewSegment(dataView, 0, length);
    bytes.forEach(byte => magicString += String.fromCharCode(byte));
    return magicString;
}

function isMidi(dataView) {
    return midiConstants[parseBytes(dataView, midiConstants.magicStringSize)] ? true : false;
}

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