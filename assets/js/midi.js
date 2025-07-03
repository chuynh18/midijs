"use strict";

const midiConstants = {
    MThd: "Header",
    MTrk: "Track"
};

const fileInput = document.getElementById("midi");

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    const arrayBuffer = file.arrayBuffer().then(buffer =>
        {
            const dataView = new DataView(buffer);
            findMagicStrings(buffer, dataView.byteLength);
        }
    );
});

function findMagicStrings(buffer, dataViewByteLength) {
    for (let i = 0; i < dataViewByteLength - 4; i += 1) {
        const tempDataView = new DataView(buffer, i, 4);
        let magicString = "";
        for (let j = 0; j < tempDataView.byteLength; j++) {
            magicString += String.fromCharCode(tempDataView.getUint8(j));
        }

        if (midiConstants[magicString]) {
            console.log(`${midiConstants[magicString]} found at byteLength ${i}.`);
        }
    }
}