const { google } = require('googleapis');

class GoogleDrive {
  setCredentials (clientId, clientSecret, redirectUris) {
    this._infinitechain = null;
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUris[0]);
    let auth = this.oauth2Client;
    this.drive = google.drive({ version: 'v3', auth });
  }

  initToken = async () => {
    try {
      let existedToken = await this._infinitechain.client.getSyncerToken();
      if (existedToken) {
        this.oauth2Client.refreshAccessToken(async (err, tokens) => {
          if (err) {
            console.log(err);
          } else {
            if (tokens.refresh_token) {
              this.oauth2Client.setCredentials(tokens);
              await this._infinitechain.client.refreshToken(tokens);
            }
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  refreshToken = async (existedToken = null) => {
    try {
      if (existedToken) {
        this.oauth2Client.setCredentials(existedToken);
        await this._infinitechain.client.refreshToken(existedToken);
      }
    } catch (e) {
      console.error(e);
    }
  }

  setInfinitechain (infinitechain) {
    this._infinitechain = infinitechain;
  }

  getReceiptsOfFolder = async (address) => {
    try {
      let targetFolderName = 'receipts-' + address;
      let targetFolderId;
      let res = await this.drive.files.list({
        includeRemoved: false,
        spaces: 'drive',
        q: `fullText contains '${targetFolderName}'`
      });
      for (let i = 0; i < res.data.files.length; i++) {
        let file = res.data.files[i];
        if (file.name == targetFolderName) {
          targetFolderId = file.id;
          break;
        }
      }
  
      if (!targetFolderId) {
        throw new Error('Folder not found.');
      }

      let response = await this.drive.files.list({
        q: `'${targetFolderId}' in parents`
      });

      return response.data.files;
    } catch (e) {
      console.log(e);
    }
  }

  async download (fileId) {
    let file = await this.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    return file.data;
  }

  async uploadReceipt (address, receipt) {
    let targetFolderName = 'receipts-' + address;
    let targetFolderId;
    let res = await this.drive.files.list({
      'fullText': targetFolderName,
      'mimeType': 'application/vnd.google-apps.folder'
    });
    for (let i = 0; i < res.data.files.length; i++) {
      let file = res.data.files[i];
      if (file.name == targetFolderName) {
        targetFolderId = file.id;
        break;
      }
    }

    if (!targetFolderId) {
      targetFolderId = await this._createFolder(address);
    }
    this._uploadReceipt(targetFolderId, receipt);
  }

  _createFolder = async (address) => {
    return new Promise(async (resolve) => {
      var fileMetadata = {
        name: 'receipts-' + address,
        mimeType: 'application/vnd.google-apps.folder'
      };

      if (address) {
        this.drive.files.create({
          resource: fileMetadata,
          fields: 'id'
        }, function (err, response) {
          if (err) {
            console.error(err);
          } else {
            resolve(response.data.id);
          }
        });
      }
    }).catch(console.error);
  }

  _uploadReceipt (folderId, receipt) {
    return new Promise(async (resolve, reject) => {
      let fileMetadata = {
        'name': receipt.lightTxHash,
        'mimeType': 'application/json',
        parents: [folderId]
      };
      let media = {
        mimeType: 'application/json',
        body: JSON.stringify(receipt)
      };
      this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
      }, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response.data.id);
        }
      });
    }).catch(console.error);
  }
}

export default GoogleDrive;
