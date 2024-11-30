const scanButton = document.getElementById('scan-button');
const cameraView = document.getElementById('camera-view');
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');

let stream = null;
let isScanning = false;

scanButton.addEventListener('click', async () => {
  // Show the camera viewport and start scanning
  cameraView.style.display = 'flex';
  scanButton.style.display = 'none'; // Hide the scan button while scanning

  try {
    // Request camera access
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    video.srcObject = stream;

    // Start scanning after the video is ready
    video.onloadedmetadata = () => {
      video.play();
      startScan();
    };
  } catch (error) {
    alert('Unable to access the camera. Please check your settings.');
    resetView(); // Reset view if camera access fails
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
        overlay.width * 0.2, // Left edge of the guide
        overlay.height * 0.35, // Top edge of the guide
        overlay.width * 0.6, // Width of the guide
        overlay.height * 0.3 // Height of the guide
      );

      const code = jsQR(imageData.data, overlay.width * 0.6, overlay.height * 0.3, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        // Validate the scanned QR code
        if (isValidUrl(code.data)) {
          // QR code is valid and contains the required substring
          isScanning = false;
          stopScan();
          showSuccessDialog(code.data); // Display success dialog
          resetView();
          return;
        }
      }
    }

    if (isScanning) {
      requestAnimationFrame(scan);
    }
  };

  scan();
}

function isValidUrl(data) {
  try {
    const url = new URL(data);
    return url.href.includes("qr.eventmagic.co"); // Accept URLs containing this substring
  } catch (_) {
    return false;
  }
}

function showSuccessDialog(url) {
  alert(`Successfully Scanned: ${url}`); // Display a dialog with the scanned URL
}

function stopScan() {
  // Stop the camera stream
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    stream = null;
  }
  video.srcObject = null;
  video.pause();
}

function resetView() {
  // Hide the camera viewport and show the scan button
  cameraView.style.display = 'none';
  scanButton.style.display = 'inline-block';
}
