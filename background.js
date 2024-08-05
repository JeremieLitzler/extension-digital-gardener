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

async function addBlockedSite(site, startTime, endTime) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['blockedSites'], 'readwrite');
    const objectStore = transaction.objectStore('blockedSites');
    const request = objectStore.add({ site, startTime, endTime });

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addSite') {
    addBlockedSite(request.site, request.startTime, request.endTime)
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
  } else if (request.action === 'getSites') {
    getAllBlockedSites()
      .then((sites) => sendResponse({ blockedSites: sites }))
      .catch((error) => sendResponse({ error: error.toString() }));
    return true;
  }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  getAllBlockedSites().then((blockedSites) => {
    const currentTime = new Date();
    const currentMinutes =
      currentTime.getHours() * 60 + currentTime.getMinutes();

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
});

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isTimeInRange(current, start, end) {
  if (start <= end) {
    return current >= start && current <= end;
  } else {
    return current >= start || current <= end;
  }
}
