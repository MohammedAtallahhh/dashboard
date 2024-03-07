import React from "react";
import html2canvas from "html2canvas";

import Camera from "./icons/Camera";

const ScreenshotButton = ({ target, title }) => {
  const watermarkedDataURL = (canvas, text) => {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    let cw, ch;

    cw = tempCanvas.width = canvas.width;
    ch = tempCanvas.height = canvas.height;

    tempCtx.drawImage(canvas, 0, 0);
    tempCtx.font = "24px verdana";

    const textWidth = tempCtx.measureText(text).width;
    tempCtx.globalAlpha = 0.5;
    tempCtx.fillStyle = "white";

    tempCtx.fillText(text, cw - textWidth - 10, ch - 20);
    tempCtx.fillStyle = "black";
    tempCtx.fillText(text, cw - textWidth - 10 + 2, ch - 20 + 2);

    return tempCanvas.toDataURL();
  };

  const downloadImage = () => {
    html2canvas(target, {
      backgroundColor: "#1b1b1e",
      ignoreElements: (el) => el.classList.contains("ignore-me"),
    }).then((canvas) => {
      const imgData = watermarkedDataURL(canvas, "WATERMARK");
      const link = document.createElement("a");

      link.href = imgData;
      link.download = `${title}-screenshot.png`;
      link.click();
    });
  };

  return (
    <button
      onClick={downloadImage}
      className="flex items-center gap-1 bg-[#101015] border-[#f7f7f7] border rounded-md p-2 py-1 text-xs font-semibold hover:bg-gray-800"
    >
      <div className="w-5">
        <Camera />
      </div>
      Screenshot
    </button>
  );
};

export default ScreenshotButton;
