let blockedSites = [];

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedSites'], function (result) {
    if (result.blockedSites) {
      blockedSites = result.blockedSites;
    }
  });
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const matchingSites = blockedSites.filter((site) =>
    details.url.includes(site.site)
  );
  const shouldBlock = matchingSites.some((site) => {
    const startMinutes = timeToMinutes(site.startTime);
    const endMinutes = timeToMinutes(site.endTime);
    return isTimeInRange(currentMinutes, startMinutes, endMinutes);
  });

  if (shouldBlock) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('blocked.html'),
    });
  }
});

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isTimeInRange(current, start, end) {
  if (start <= end) {
    return current >= start && current < end;
  } else {
    return current >= start || current < end;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  if (request.action === 'addSite') {
    blockedSites.push({
      site: request.site,
      startTime: request.startTime,
      endTime: request.endTime,
    });
    chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError });
      } else {
        sendResponse({ blockedSites: blockedSites });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === 'removeSite') {
    blockedSites = blockedSites.filter(
      (siteObj) =>
        !(
          siteObj.site === request.site &&
          siteObj.startTime === request.startTime &&
          siteObj.endTime === request.endTime
        )
    );
    chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({ error: chrome.runtime.lastError });
      } else {
        sendResponse({ blockedSites: blockedSites });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
});

// Load blocked sites when the background script starts
chrome.storage.sync.get(['blockedSites'], function (result) {
  if (result.blockedSites) {
    blockedSites = result.blockedSites;
  }
});
