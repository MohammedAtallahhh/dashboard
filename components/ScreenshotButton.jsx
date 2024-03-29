import { toPng } from "html-to-image";

import Camera from "./icons/Camera";

const ScreenshotButton = ({ target, title }) => {
  // const watermarkedDataURL = (canvas, text) => {
  //   const tempCanvas = document.createElement("canvas");
  //   const tempCtx = tempCanvas.getContext("2d");
  //   let cw, ch;

  //   cw = tempCanvas.width = canvas.width;
  //   ch = tempCanvas.height = canvas.height;

  //   tempCtx.drawImage(canvas, 0, 0);
  //   tempCtx.font = "24px verdana";

  //   const textWidth = tempCtx.measureText(text).width;
  //   tempCtx.globalAlpha = 0.5;
  //   tempCtx.fillStyle = "white";

  //   tempCtx.fillText(text, cw - textWidth - 10, ch - 20);
  //   tempCtx.fillStyle = "black";
  //   tempCtx.fillText(text, cw - textWidth - 10 + 2, ch - 20 + 2);

  //   return tempCanvas.toDataURL();
  // };

  const downloadImage = () => {
    toPng(target, {
      // filter: (node) => !node.classList.contains("ignore-me"),
    }).then(function (dataUrl) {
      const link = document.createElement("a");

      link.href = dataUrl;
      link.download = `${title}-screenshot.jpg`;
      link.click();
    });
  };

  return (
    <button
      onClick={downloadImage}
      className="flex items-center gap-1 bg-background border-text border rounded-md p-2 py-1 text-xs font-semibold hover:bg-text hover:text-background hover:border-black group"
    >
      <div className="w-5 group-hover:invert">
        <Camera />
      </div>
      Screenshot
    </button>
  );
};

export default ScreenshotButton;
