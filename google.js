if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}
const { google } = require('googleapis')
const path = require('path')
const fs = require('fs');


const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;


const oauthclient = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
)

oauthclient.setCredentials({refresh_token: REFRESH_TOKEN})

const drive = google.drive({
    version: 'v3',
    auth: oauthclient
})

const filePath = path.join(__dirname, 'flyer.jpg')

async function uploadFile(){
    try {
        
        const response =  await drive.files.create({
            requestBody: {
                name: 'flyerupload.jpg',
                mimeType: 'image/jpg'
            },
            media: {
                mimeType: 'image/jpg',
                body: fs.createReadStream(filePath)
            }
        })

        console.log(response.data)
    } catch (e){
        console.log(e.message)
    }
}

async function generateURL() {
    try {
        const fileID = '1Gk1LDx_OXiRvkPrMvyd2Qfw2ACYTAXa-';
        await drive.permissions.create({
            fileId: fileID,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })

        const result = await drive.files.get({
            fileId: fileID,
            fields: 'webViewLink, webContentLink'
        })

        console.log(result.data)
    } catch (e){
        console.log(e.message)
    }
}

generateURL()
// uploadFile()