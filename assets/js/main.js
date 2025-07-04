"use strict";

import getMidi from "./midi.js";

const fileInput = document.getElementById("midi");

fileInput.addEventListener("change", () => {
    midi = getMidi(fileInput);
    console.log(midi);
    midi.then(result => console.log(result));
});