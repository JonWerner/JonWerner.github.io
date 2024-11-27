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
  cameraView.classList.remove('hidden');
  successPage.classList.add('hidden');

  try {
    // Access the camera
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    video.srcObject = stream;

    // Start scanning when the video metadata is loaded
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
      // Draw the video frame onto the canvas
      ctx.drawImage(video, 0, 0, overlay.width, overlay.height);

      // Extract the image data from the canvas
      const imageData = ctx.getImageData(0, 0, overlay.width, overlay.height);

      // Use jsQR to decode the QR code
      const code = jsQR(imageData.data, overlay.width, overlay.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // QR code detected, stop scanning
        isScanning = false;
        displaySuccess(code.data);
        return;
      }
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scan);
    }
  };

  scan();
}

function stopScan() {
  // Stop the video stream and release the camera
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop()); // Explicitly stop each track
    stream = null; // Clear the stream reference
  }

  // Stop the video element
  video.srcObject = null;
  video.pause();
}

function displaySuccess(url) {
  stopScan(); // Ensure the camera is stopped
  cameraView.classList.add('hidden'); // Hide the camera view
  successPage.classList.remove('hidden'); // Show the success page
  urlDisplay.textContent = url; // Display the scanned URL
}

backButton.addEventListener('click', () => {
  successPage.classList.add('hidden');
  scanButton.click(); // Restart the scanning process
});
