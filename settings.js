let blockedSites = [];

function checkDbAndLoadSites() {
  chrome.runtime.sendMessage({ action: 'isDbReady' }, function (response) {
    if (response && response.dbReady) {
      console.log('db is ready');
      loadBlockedSites();
    } else {
      setTimeout(checkDbAndLoadSites, 100); // Check again after 100ms
    }
  });
}

function loadBlockedSites() {
  chrome.runtime.sendMessage({ action: 'getSites' }, function (response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (response && response.blockedSites) {
      blockedSites = response.blockedSites;
      updateBlockedSitesList(blockedSites);
      updateAutocompleteList();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ action: 'getSites' }, function (response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    if (response && response.blockedSites) {
      blockedSites = response.blockedSites;
      updateBlockedSitesList(blockedSites);
      updateAutocompleteList();
    }
  });
});

function updateAutocompleteList() {
  const sitesList = document.getElementById('sitesList');
  const uniqueSites = [...new Set(blockedSites.map((site) => site.site))];

  sitesList.innerHTML = '';
  uniqueSites.forEach((site) => {
    const option = document.createElement('option');
    option.value = site;
    sitesList.appendChild(option);
  });
}

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
          blockedSites = response.blockedSites;
          siteInput.value = '';
          startTimeInput.value = '';
          endTimeInput.value = '';
          updateBlockedSitesList(blockedSites);
          updateAutocompleteList();
        } else {
          console.error('Invalid response from background script');
        }
      }
    );
  }
});

function updateBlockedSitesList(sites) {
  console.log('loading existing sites in the list', sites);
  let list = document.getElementById('blockedSitesList');
  list.innerHTML = '';
  sites.forEach(function (siteObj) {
    let li = document.createElement('li');
    li.className = 'bg-white p-4 rounded-md shadow';
    li.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-semibold">${siteObj.site}</span>
                <div class="space-x-2">
                    <input type="time" value="${siteObj.startTime}" class="edit-start-time px-2 py-1 border rounded">
                    <input type="time" value="${siteObj.endTime}" class="edit-end-time px-2 py-1 border rounded">
                </div>
            </div>
            <div class="mt-2 flex justify-between items-center">
                <span class="text-sm text-green-500 save-feedback hidden">Saved!</span>
                <button class="remove-site bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Remove</button>
            </div>
        `;

    const saveFeedback = li.querySelector('.save-feedback');
    const startTimeInput = li.querySelector('.edit-start-time');
    const endTimeInput = li.querySelector('.edit-end-time');

    function saveChanges() {
      const newStartTime = startTimeInput.value;
      const newEndTime = endTimeInput.value;

      if (
        newStartTime !== siteObj.startTime ||
        newEndTime !== siteObj.endTime
      ) {
        chrome.runtime.sendMessage(
          {
            action: 'updateSite',
            id: siteObj.id,
            startTime: newStartTime,
            endTime: newEndTime,
          },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            if (response && response.blockedSites) {
              blockedSites = response.blockedSites;
              siteObj.startTime = newStartTime;
              siteObj.endTime = newEndTime;
              saveFeedback.classList.remove('hidden');
              setTimeout(() => {
                saveFeedback.classList.add('hidden');
              }, 2000);
              updateAutocompleteList();
            } else {
              console.error('Invalid response from background script');
            }
          }
        );
      }
    }

    startTimeInput.addEventListener('change', saveChanges);
    endTimeInput.addEventListener('change', saveChanges);
    startTimeInput.addEventListener('blur', saveChanges);
    endTimeInput.addEventListener('blur', saveChanges);

    li.querySelector('.remove-site').onclick = function () {
      chrome.runtime.sendMessage(
        {
          action: 'removeSite',
          id: siteObj.id,
        },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          if (response && response.blockedSites) {
            blockedSites = response.blockedSites;
            updateBlockedSitesList(blockedSites);
            updateAutocompleteList();
          } else {
            console.error('Invalid response from background script');
          }
        }
      );
    };

    list.appendChild(li);
  });
}
