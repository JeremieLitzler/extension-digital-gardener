function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

async function uploadToDrive(token, fileName, content) {
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', new Blob([content], { type: 'application/json' }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: new Headers({ Authorization: 'Bearer ' + token }),
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload file to Google Drive');
  }

  return await response.json();
}

async function downloadFromDrive(token, fileName) {
  // First, search for the file
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`,
    {
      headers: new Headers({ Authorization: 'Bearer ' + token }),
    }
  );

  if (!searchResponse.ok) {
    throw new Error('Failed to search for file in Google Drive');
  }

  const searchResult = await searchResponse.json();
  if (searchResult.files.length === 0) {
    throw new Error('File not found in Google Drive');
  }

  const fileId = searchResult.files[0].id;

  // Now, download the file
  const downloadResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: new Headers({ Authorization: 'Bearer ' + token }),
    }
  );

  if (!downloadResponse.ok) {
    throw new Error('Failed to download file from Google Drive');
  }

  return await downloadResponse.text();
}
