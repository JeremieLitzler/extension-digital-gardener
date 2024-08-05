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

document.addEventListener('DOMContentLoaded', setRandomBackground);
