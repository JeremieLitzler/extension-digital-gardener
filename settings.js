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

document.getElementById('exportCSV').addEventListener('click', exportCSV);
document.getElementById('exportJSON').addEventListener('click', exportJSON);
document
  .getElementById('importButton')
  .addEventListener('click', () =>
    document.getElementById('importFile').click()
  );
document
  .getElementById('importFile')
  .addEventListener('change', importConfiguration);

function exportCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'site,startTime,endTime\n';
  blockedSites.forEach((site) => {
    csvContent += `${site.site},${site.startTime},${site.endTime}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'blocked_sites.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportJSON() {
  const jsonContent = JSON.stringify(blockedSites, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'blocked_sites.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importConfiguration(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const fileExtension = file.name.split('.').pop().toLowerCase();

    let importedSites;
    if (fileExtension === 'csv') {
      importedSites = parseCSV(content);
    } else if (fileExtension === 'json') {
      importedSites = JSON.parse(content);
    } else {
      alert('Unsupported file format');
      return;
    }

    importSites(importedSites);
  };
  reader.readAsText(file);
}

function parseCSV(content) {
  const lines = content.split('\n').filter((line) => line.trim() !== '');
  const headers = lines[0].split(',');
  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(',');
      return {
        site: values[0],
        startTime: values[1],
        endTime: values[2],
      };
    })
    .filter((site) => site.site && site.startTime && site.endTime);
}

function importSites(sites) {
  let importedCount = 0;
  sites.forEach((site) => {
    chrome.runtime.sendMessage(
      {
        action: 'addSite',
        site: site.site,
        startTime: site.startTime,
        endTime: site.endTime,
      },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        if (response && response.blockedSites) {
          importedCount++;
          if (importedCount === sites.length) {
            blockedSites = response.blockedSites;
            updateBlockedSitesList(blockedSites);
            updateAutocompleteList();
            alert(`Successfully imported ${importedCount} sites`);
          }
        } else {
          console.error('Invalid response from background script');
        }
      }
    );
  });
}

document
  .getElementById('exportToDrive')
  .addEventListener('click', exportToDrive);
document
  .getElementById('importFromDrive')
  .addEventListener('click', importFromDrive);

async function exportToDrive() {
  try {
    const token = await getAuthToken();
    const content = JSON.stringify(blockedSites, null, 2);
    const fileName = 'blocked_sites.json';
    const fileDetails = await uploadToDrive(token, fileName, content);

    const message = `File name: ${fileDetails.name}<br><br>You can <a href="${fileDetails.webViewLink}" target="_blank">view it here</a>.`;

    document.getElementById('driveModalMessage').innerHTML = message;
    document.getElementById('driveModal').classList.remove('hidden');
  } catch (error) {
    console.error('Error exporting to Drive:', error);
    alert('Error exporting to Google Drive');
  }
}

document.getElementById('closeModal').addEventListener('click', function () {
  document.getElementById('driveModal').classList.add('hidden');
});

async function importFromDrive() {
  try {
    const token = await getAuthToken();
    const content = await downloadFromDrive(token, 'blocked_sites.json');
    const importedSites = JSON.parse(content);
    await importSites(importedSites);
    alert('Successfully imported from Google Drive');
  } catch (error) {
    console.error('Error importing from Drive:', error);
    alert('Error importing from Google Drive');
  }
}
