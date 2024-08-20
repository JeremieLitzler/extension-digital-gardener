let dbPromise;

function initDB() {
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('BlockedSitesDB', 1);

    request.onerror = function (event) {
      console.error('Database error: ' + event.target.error);
      reject('Database error: ' + event.target.error);
    };

    request.onsuccess = function (event) {
      console.log('Database opened successfully');
      resolve(event.target.result);
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore('blockedSites', {
        keyPath: 'id',
        autoIncrement: true,
      });
      objectStore.createIndex('site', 'site', { unique: false });
    };
  });
}

initDB();

async function getDB() {
  return await dbPromise;
}

async function addBlockedSite(site, startTime, endTime, days) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['blockedSites'], 'readwrite');
    const objectStore = transaction.objectStore('blockedSites');
    const request = objectStore.add({ site, startTime, endTime, days });

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject('Error adding site: ' + event.target.error);
    };
  });
}

async function removeBlockedSite(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['blockedSites'], 'readwrite');
    const objectStore = transaction.objectStore('blockedSites');
    const request = objectStore.delete(id);

    request.onsuccess = function (event) {
      resolve();
    };

    request.onerror = function (event) {
      reject('Error removing site: ' + event.target.error);
    };
  });
}

async function updateBlockedSite(id, startTime, endTime, days) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['blockedSites'], 'readwrite');
    const objectStore = transaction.objectStore('blockedSites');
    const getRequest = objectStore.get(id);

    getRequest.onsuccess = function (event) {
      const data = event.target.result;
      data.startTime = startTime;
      data.endTime = endTime;
      data.days = days;
      const updateRequest = objectStore.put(data);

      updateRequest.onsuccess = function () {
        resolve();
      };

      updateRequest.onerror = function (event) {
        reject('Error updating site: ' + event.target.error);
      };
    };

    getRequest.onerror = function (event) {
      reject('Error getting site for update: ' + event.target.error);
    };
  });
}

async function getAllBlockedSites() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['blockedSites'], 'readonly');
    const objectStore = transaction.objectStore('blockedSites');
    const request = objectStore.getAll();

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject('Error getting sites: ' + event.target.error);
    };
  });
}

function extractDomain(url) {
  let domain;
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = url;
  }
  return domain.replace(/^www\./, '');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'isDbReady') {
    getDB()
      .then(() => sendResponse({ dbReady: true }))
      .catch(() => sendResponse({ dbReady: false }));
    return true;
  }

  if (request.action === 'openSettings') {
    chrome.runtime.openOptionsPage();
  }

  if (request.action === 'addSite') {
    addBlockedSite(request.site, request.startTime, request.endTime, request.days)
      .then(() => getAllBlockedSites())
      .then((sites) => sendResponse({ blockedSites: sites }))
      .catch((error) => sendResponse({ error: error.toString() }));
    return true;
  } else if (request.action === 'removeSite') {
    removeBlockedSite(request.id)
      .then(() => getAllBlockedSites())
      .then((sites) => sendResponse({ blockedSites: sites }))
      .catch((error) => sendResponse({ error: error.toString() }));
    return true;
  } else if (request.action === 'updateSite') {
    updateBlockedSite(request.id, request.startTime, request.endTime, request.days)
      .then(() => getAllBlockedSites())
      .then((sites) => sendResponse({ blockedSites: sites }))
      .catch((error) => sendResponse({ error: error.toString() }));
    return true;
  } else if (request.action === 'getSites') {
    getAllBlockedSites()
      .then((sites) => sendResponse({ blockedSites: sites }))
      .catch((error) => sendResponse({ error: error.toString() }));
    return true;
  }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only process main frame navigation
  if (details.frameId !== 0) return;

  getAllBlockedSites().then((blockedSites) => {
    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const currentDay = currentTime.getDay(); // 0 (Sunday) to 6 (Saturday)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const urlDomain = extractDomain(details.url);

    const matchingSites = blockedSites.filter((site) => {
      const blockedDomain = extractDomain(site.site);
      return (
        urlDomain === blockedDomain || urlDomain.endsWith(`.${blockedDomain}`)
      );
    });
    const shouldBlock = matchingSites.some((site) => {
      const startMinutes = timeToMinutes(site.startTime);
      const endMinutes = timeToMinutes(site.endTime);
      const isDayMatched = site.days && site.days[daysOfWeek[currentDay]];
      return isDayMatched && isTimeInRange(currentMinutes, startMinutes, endMinutes);
    });

    if (shouldBlock) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL(`blocked.html?source=${details.url}`),
      });
    }
  });
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
