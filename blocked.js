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

function loadRandomValue(values, callback) {
  const randomIndex = Math.floor(Math.random() * values.length);
  const randomValue = values[randomIndex];
  callback(randomValue);
}

async function loadRandomQuote() {
  const quotes = await fetch('static/json/quotes.json')
    .then((response) => response.json())
    .then((data) => {
      return data.quotes;
    })
    .catch((error) => {
      console.error('Error loading quotes:', error);
    });

  loadRandomValue(quotes, (randomQuote) => {
    const quoteTextElement = document.getElementById('quoteText');
    const quoteAuthorElement = document.getElementById('quoteAuthor');

    quoteTextElement.textContent = `"${randomQuote.text}"`;
    quoteAuthorElement.textContent = `- ${randomQuote.author}`;
  });
}

async function loadRandomHeading() {
  const sentences = await fetch('static/json/cta-sentences.json')
    .then((response) => response.json())
    .then((data) => {
      return data.sentences;
    })
    .catch((error) => {
      console.error('Error loading CTA sentences:', error);
    });

  loadRandomValue(sentences, (randomHeading) => {
    const headingElement = document.getElementById('heading');
    headingElement.textContent = `${randomHeading}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setRandomBackground();
  displayBlockedUrl();
  setupSettingsButton();
  loadRandomHeading();
  loadRandomQuote();
});
