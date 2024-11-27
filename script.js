const scanButton = document.getElementById('scan-button');
const backButton = document.getElementById('back-button');
const cameraView = document.getElementById('camera-view');
const successPage = document.getElementById('success-page');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const urlDisplay = document.getElementById('url-display');

let stream;
let isScanning = false;

scanButton.addEventListener('click', async () => {
  cameraView.classList.remove('hidden');
  successPage.classList.add('hidden');

  try {
    // Access the camera
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    video.srcObject = stream;

    // Start scanning
    video.onloadedmetadata = () => {
      video.play();
      startScan();
    };
  } catch (error) {
    alert('Camera access denied or unavailable.');
  }
});

async function startScan() {
  const ctx = overlay.getContext('2d');
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
  isScanning = true;

  const scan = () => {
    if (isScanning && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Draw video frame on canvas
      ctx.drawImage(video, 0, 0, overlay.width, overlay.height);

      // Get image data from canvas
      const imageData = ctx.getImageData(0, 0, overlay.width, overlay.height);

      // Decode QR code
      const code = jsQR(imageData.data, overlay.width, overlay.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR code detected
        isScanning = false;
        stopScan();
        displaySuccess(code.data);
        return;
      }
    }

    // Keep scanning
    if (isScanning) {
      requestAnimationFrame(scan);
    }
  };

  scan();
}

function stopScan() {
  video.srcObject = null;
  stream.getTracks().forEach((track) => track.stop());
}

function displaySuccess(url) {
  cameraView.classList.add('hidden');
  successPage.classList.remove('hidden');
  urlDisplay.textContent = url;
}

backButton.addEventListener('click', () => {
  successPage.classList.add('hidden');
  scanButton.click();
});
