/**
 * Google Drive REST API service for ERIK-HUB Finance Manager Cloud Sync
 */

export interface BackupDataPayload {
  version: string;
  appName: string;
  lastModified: string;
  backupDate: string;
  userEmail?: string;
  userPhone?: string;
  data: {
    orders: any[];
    expenditures: any[];
    customers: any[];
    products: any[];
    expenseProducts: any[];
    expensePurposes: any[];
    categories: any[];
    settings: any;
    activityLogs: any[];
  };
}

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  createdTime?: string;
}

const BACKUP_FILENAME = 'erik_hub_finance_backup.json';

/**
 * Searches Google Drive for the existing ERIK-HUB backup file
 */
export const findDriveBackupFile = async (accessToken: string): Promise<DriveFileInfo | null> => {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,createdTime)&spaces=drive`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google Drive access expired or unauthorized. Please re-authenticate.');
    }
    const err = await response.text();
    throw new Error(`Failed to query Google Drive: ${err}`);
  }

  const result = await response.json();
  if (result.files && result.files.length > 0) {
    // Return the newest modified one
    const sorted = result.files.sort((a: DriveFileInfo, b: DriveFileInfo) => 
      new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime()
    );
    return sorted[0];
  }

  return null;
};

/**
 * Uploads or updates the ERIK-HUB backup JSON file in Google Drive
 */
export const saveBackupToDrive = async (
  accessToken: string,
  payload: BackupDataPayload,
  existingFileId?: string
): Promise<DriveFileInfo> => {
  const fileContent = JSON.stringify(payload, null, 2);

  // If no existingFileId is provided, check if one already exists in Drive
  let targetFileId = existingFileId;
  if (!targetFileId) {
    const existing = await findDriveBackupFile(accessToken);
    if (existing) {
      targetFileId = existing.id;
    }
  }

  if (targetFileId) {
    // Update existing file using multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      description: `ERIK-HUB Finance Manager Cloud Sync - Updated ${new Date().toLocaleString()}`,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${targetFileId}?uploadType=multipart&fields=id,name,modifiedTime,size`;

    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to update Google Drive backup: ${err}`);
    }

    return await response.json();
  } else {
    // Create new file
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      description: `ERIK-HUB Finance Manager Cloud Sync - Created ${new Date().toLocaleString()}`,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size';

    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create Google Drive backup: ${err}`);
    }

    return await response.json();
  }
};

/**
 * Downloads and parses backup data from Google Drive
 */
export const downloadBackupFromDrive = async (
  accessToken: string,
  fileId: string
): Promise<BackupDataPayload> => {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const response = await fetch(downloadUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to download backup from Google Drive: ${err}`);
  }

  const json = await response.json();
  return json as BackupDataPayload;
};

/**
 * Fetches Google Drive user profile / about info
 */
export const getDriveAboutInfo = async (accessToken: string) => {
  const url = 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  return await response.json();
};
