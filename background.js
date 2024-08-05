// Initialize rules
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['blockedSites'], function (result) {
    if (result.blockedSites) {
      updateBlockRules(result.blockedSites);
    }
  });
});

// Function to update blocking rules
function updateBlockRules(blockedSites) {
  let rules = blockedSites.flatMap((site, index) => [
    {
      id: index * 3 + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' },
      },
      condition: {
        urlFilter: `||${site}^`,
        resourceTypes: ['main_frame'],
      },
    },
    {
      id: index * 3 + 2,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' },
      },
      condition: {
        urlFilter: `*://*.${site}/*`,
        resourceTypes: ['main_frame'],
      },
    },
    {
      id: index * 3 + 3,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' },
      },
      condition: {
        urlFilter: `*://${site}/*`,
        resourceTypes: ['main_frame'],
      },
    },
  ]);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((rule) => rule.id),
    addRules: rules,
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addSite') {
    chrome.storage.sync.get(['blockedSites'], function (result) {
      let blockedSites = result.blockedSites || [];
      blockedSites.push(request.site);
      chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
        updateBlockRules(blockedSites);
        sendResponse({ blockedSites: blockedSites });
      });
    });
    return true;
  } else if (request.action === 'removeSite') {
    chrome.storage.sync.get(['blockedSites'], function (result) {
      let blockedSites = result.blockedSites || [];
      blockedSites = blockedSites.filter((site) => site !== request.site);
      chrome.storage.sync.set({ blockedSites: blockedSites }, function () {
        updateBlockRules(blockedSites);
        sendResponse({ blockedSites: blockedSites });
      });
    });
    return true;
  }
});
