const scanButton = document.getElementById('scan-button');
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

    // Start scanning when the video is ready
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
  // Stop the camera
  video.srcObject = null;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  // Hide the camera view
  cameraView.classList.add('hidden');
}

function displaySuccess(url) {
  // Display the success page with the URL
  successPage.classList.remove('hidden');
  urlDisplay.textContent = url;
}

// Automatically restart scanning when clicking the "Scan" button
document.getElementById('scan-button').addEventListener('click', () => {
  cameraView.classList.add('hidden');
  successPage.classList.add('hidden');
});
