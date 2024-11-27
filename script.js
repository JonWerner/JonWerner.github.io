const scanButton = document.getElementById('scan-button');
const backButton = document.getElementById('back-button');
const cameraView = document.getElementById('camera-view');
const successPage = document.getElementById('success-page');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const urlDisplay = document.getElementById('url-display');

let stream;

// Initialize QR scanning
scanButton.addEventListener('click', async () => {
  cameraView.classList.remove('hidden');
  successPage.classList.add('hidden');

  // Access camera
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;

    // Start scanning
    startScan();
  } catch (error) {
    alert('Camera access denied or unavailable.');
  }
});

// Scan QR Code
async function startScan() {
  const ctx = overlay.getContext('2d');
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;

  const scan = () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      ctx.drawImage(video, 0, 0, overlay.width, overlay.height);
      const imageData = ctx.getImageData(0, 0, overlay.width, overlay.height);
      const code = jsQR(imageData.data, overlay.width, overlay.height);

      if (code) {
        stopScan();
        displaySuccess(code.data);
      }
    }
    requestAnimationFrame(scan);
  };

  scan();
}

// Stop camera and QR scanning
function stopScan() {
  video.srcObject = null;
  stream.getTracks().forEach(track => track.stop());
}

// Display the success page
function displaySuccess(url) {
  cameraView.classList.add('hidden');
  successPage.classList.remove('hidden');
  urlDisplay.textContent = url;
}

// Back button to rescan
backButton.addEventListener('click', () => {
  successPage.classList.add('hidden');
  scanButton.click();
});
