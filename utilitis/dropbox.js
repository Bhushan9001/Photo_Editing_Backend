const {Dropbox} = require('dropbox');
const router = require('express').Router();

const dbx = new Dropbox({accessToken:process.env.DROPBOX_ACCESS_TOKEN})

const getDropboxLink = async (req,res)=>{
    try {
        const response = await dbx.fileRequestsCreate({
            title:"Upload Your files",
            destination:"/uploads",
            open:true
        });

        res.status(201).json({"uploadurl":response.result.url});
    } catch (error) {
        console.error('Error creating file request:', error);
        if (error.status === 401) {
            res.status(401).json({ error: 'Authentication failed. Please check your Dropbox access token.' });
        } else {
            res.status(500).json({ error: 'Failed to create file request', details: error.message });
        }
    }
}

router.get("/get-upload-link",getDropboxLink);

module.exports = router;