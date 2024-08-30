const { Dropbox } = require('dropbox');
const router = require('express').Router();
const axios = require('axios');

const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

const getDropboxLink = async (req, res) => {
    try {
        const response = await axios.post('https://api.dropboxapi.com/2/file_requests/create', {
            title: "Upload Your files",
            destination: "/uploads",
            open: true
        }, {
            headers: {
                'Authorization': `${process.env.DROPBOX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(201).json({ "uploadurl": response.data.url });
    } catch (error) {
        console.error('Error creating file request:', error.response?.data);
        if (error.response?.status === 401) {
            res.status(401).json({ error: 'Authentication failed. Please check your Dropbox access token.' });
        } else {
            res.status(500).json({ error: 'Failed to create file request', details: error.message });
        }
    }
}

router.get("/get-upload-link", getDropboxLink);

module.exports = router;