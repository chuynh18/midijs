"use strict";

const fileInput = document.getElementById("midi");

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    const arrayBuffer = file.arrayBuffer().then(buffer =>
        {
            const dataView = new DataView(buffer);
            console.log(dataView.getUint8(0));
            console.log(dataView.getUint8(1));
            console.log(dataView.getUint8(2));
            console.log(dataView.getUint8(3));
        }
    );
});

