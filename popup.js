// Load blocked sites when popup opens
document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get(['blockedSites'], function (result) {
    if (result.blockedSites) {
      updateBlockedSitesList(result.blockedSites);
    }
  });
});

// Add site button click handler
document.getElementById('addSite').addEventListener('click', function () {
  let siteInput = document.getElementById('siteInput');
  let site = siteInput.value.trim();
  if (site) {
    chrome.runtime.sendMessage(
      { action: 'addSite', site: site },
      function (response) {
        siteInput.value = '';
        updateBlockedSitesList(response.blockedSites);
      }
    );
  }
});

// Update the list of blocked sites in the popup
function updateBlockedSitesList(sites) {
  let list = document.getElementById('blockedSitesList');
  list.innerHTML = '';
  sites.forEach(function (site) {
    let li = document.createElement('li');
    li.textContent = site;
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = function () {
      chrome.runtime.sendMessage(
        { action: 'removeSite', site: site },
        function (response) {
          updateBlockedSitesList(response.blockedSites);
        }
      );
    };
    li.appendChild(removeButton);
    list.appendChild(li);
  });
}
