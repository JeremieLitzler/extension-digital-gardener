document.getElementById('openManager').addEventListener('click', function () {
  chrome.tabs.create({ url: 'settings.html' });
});
