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
  let startTimeInput = document.getElementById('startTime');
  let endTimeInput = document.getElementById('endTime');

  let site = siteInput.value.trim();
  let startTime = startTimeInput.value;
  let endTime = endTimeInput.value;

  if (site && startTime && endTime) {
    chrome.runtime.sendMessage(
      {
        action: 'addSite',
        site: site,
        startTime: startTime,
        endTime: endTime,
      },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response && response.blockedSites) {
          siteInput.value = '';
          startTimeInput.value = '00:00';
          endTimeInput.value = '23:59';
          updateBlockedSitesList(response.blockedSites);
        } else {
          console.error('Invalid response from background script');
        }
      }
    );
  }
});

// Update the list of blocked sites in the popup
function updateBlockedSitesList(sites) {
  let list = document.getElementById('blockedSitesList');
  list.innerHTML = '';
  sites.forEach(function (siteObj) {
    let li = document.createElement('li');
    li.textContent = `${siteObj.site} (${siteObj.startTime} - ${siteObj.endTime})`;
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = function () {
      chrome.runtime.sendMessage(
        {
          action: 'removeSite',
          site: siteObj.site,
          startTime: siteObj.startTime,
          endTime: siteObj.endTime,
        },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          if (response && response.blockedSites) {
            updateBlockedSitesList(response.blockedSites);
          } else {
            console.error('Invalid response from background script');
          }
        }
      );
    };
    li.appendChild(removeButton);
    list.appendChild(li);
  });
}
