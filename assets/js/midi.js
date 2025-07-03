"use strict";

const midiConstants = {
    MThd: "Header",
    MTrk: "Track",
    magicStringSize: 4
};

const fileInput = document.getElementById("midi");

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    const arrayBuffer = file.arrayBuffer().then(buffer =>
        {
            const first4Bytes = new DataView(buffer, 0, 4);
            if (! isMidi(first4Bytes)) {
                console.log("Not a midi file!");
                return;
            }

            const dataView = new DataView(buffer);
            const tracks = findTracks(buffer, dataView.byteLength);
            console.log(tracks);
        }
    );
});

function findTracks(buffer, dataViewByteLength) {
    const trackStart = [];
    for (let i = 0; i < dataViewByteLength - 4; i += 1) {
        const tempDataView = new DataView(buffer, i, 4);
        let magicString = parseBytes(tempDataView);

        if (midiConstants[magicString] === midiConstants.MTrk) {
            trackStart.push({
                trackStartIndex: i + midiConstants.magicStringSize
            });
        }
    }

    for (let i = 0; i < trackStart.length - 1; i++) {
        trackStart[i].trackLength = trackStart[i+1].trackStartIndex - trackStart[i].trackStartIndex;
    }

    trackStart.at(-1).trackLength = dataViewByteLength - trackStart.at(-1).trackStartIndex;
    return trackStart;
}

function parseBytes(dataView) {
    let magicString = "";
    for (let i = 0; i < dataView.byteLength; i++) {
        magicString += String.fromCharCode(dataView.getUint8(i));
    }
    return magicString;
}

function isMidi(dataViewFirst4Bytes) {
    return midiConstants[parseBytes(dataViewFirst4Bytes)] ? true : false;
}