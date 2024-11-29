const scanButton = document.getElementById('scan-button');
const backButton = document.getElementById('back-button');
const cameraView = document.getElementById('camera-view');
const successPage = document.getElementById('success-page');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const urlDisplay = document.getElementById('url-display');

let stream = null;
let isScanning = false;

scanButton.addEventListener('click', async () => {
  cameraView.style.display = 'flex'; // Show the camera viewport
  successPage.classList.add('hidden');

  try {
    // Request camera access with video constraints
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    video.srcObject = stream;

    // Start scanning after video metadata is loaded
    video.onloadedmetadata = () => {
      video.play();
      startScan();
    };
  } catch (error) {
    alert('Unable to access the camera. Please check your settings.');
  }
});

async function startScan() {
  const ctx = overlay.getContext('2d');
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
  isScanning = true;

  const scan = () => {
    if (isScanning && video.readyState === video.HAVE_ENOUGH_DATA) {
      ctx.drawImage(video, 0, 0, overlay.width, overlay.height);
      const imageData = ctx.getImageData(
        overlay.width * 0.2, // Start at left edge of the guide
        overlay.height * 0.35, // Start at top edge of the guide
        overlay.width * 0.6, // Width of the guide
        overlay.height * 0.3 // Height of the guide
      );

      const code = jsQR(imageData.data, overlay.width * 0.6, overlay.height * 0.3, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        isScanning = false;
        displaySuccess(code.data);
        return;
      }
    }

    if (isScanning) {
      requestAnimationFrame(scan);
    }
  };

  scan();
}

function stopScan() {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    stream = null;
  }
  video.srcObject = null;
  video.pause();
}

function displaySuccess(url) {
  stopScan();
  cameraView.style.display = 'none'; // Hide the camera viewport
  successPage.classList.remove('hidden'); // Show the success page
  urlDisplay.textContent = url;
}

backButton.addEventListener('click', () => {
  successPage.classList.add('hidden');
  scanButton.click(); // Restart the scanning process
});
