function openCenteredPopup(url, title, w, h) {
  // Calculate the position coordinates
  const dualScreenLeft =
    window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop =
    window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : screen.width;
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : screen.height;

  const left = width / 2 - w / 2 + dualScreenLeft;
  const top = height / 2 - h / 2 + dualScreenTop;

  // Open the window
  const newWindow = window.open(
    url,
    title,
    `
    scrollbars=yes,
    width=${w},
    height=${h},
    top=${top},
    left=${left}
  `,
  );

  // Put focus on the new window
  if (window.focus) {
    newWindow.focus();
  }

  return newWindow;
}

const pickerURL = "http://localhost:5173/load";

function pickFile() {
  const picker = openCenteredPopup(pickerURL, "Pick file", 800, 600);

  window.addEventListener("message", (event) => {
    if (event.source === picker) {
      if (typeof event.data === "string") {
        switch (event.data) {
          case "ready":
            console.log("Picker ready");
            break;
          case "complete":
            picker.close();
            break;
        }
      } else if (event.data instanceof File) {
        const file = event.data;

        console.log(file);
        document.getElementById("file-data").textContent = [
          file.name,
          file.size,
          file.type,
        ].join(", ");
      }
    }
  });
}
