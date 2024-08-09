function setRandomBackground() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;

  fetch(imageUrl)
    .then((response) => response.url)
    .then((finalUrl) => {
      document.body.style.backgroundImage = `url(${finalUrl})`;
    })
    .catch((error) => {
      console.error('Error loading image:', error);
      document.body.style.backgroundColor = '#f0f0f0'; // Fallback background color
    });
}

function displayBlockedUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const blockedUrl = urlParams.get('source');
  const blockedUrlElement = document.getElementById('blockedUrl');
  const anchor = document.createElement('a');
  anchor.href = blockedUrl;
  anchor.innerText = blockedUrl;
  console.log('blockedUrl > ', blockedUrl);
  if (blockedUrl) {
    blockedUrlElement.appendChild(anchor);
  } else {
    blockedUrlElement.textContent = 'Unknown';
  }
}

function setupSettingsButton() {
  const settingsButton = document.getElementById('settingsButton');
  settingsButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openSettings' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setRandomBackground();
  displayBlockedUrl();
  setupSettingsButton();
});
