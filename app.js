const ipfsClient = require('ipfs-http-client');
const express = require("express");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const ipfs = ipfsClient.create(new URL('http://127.0.0.1:5001'));
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({exnteded:true}))
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/upload', (req, res) => {
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    file.mv(filePath, async (err) => {
        if (err) {
            console.log('Error: failed to download the file');
            return res.status(500).send(err);
        }

        const fileHash = await addFile(fileName, filePath);
        fs.unlink(filePath, (err) => {
            if(err) console.log(err);
        });    

        res.render('upload', { fileName, fileHash });
    });
})

const addFile = async (fileName, filePath) => {
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path: fileName, content: file });
    const fileHash = (fileAdded.cid).toString()

    return fileHash;
}


app.listen(3000, () => {
    console.log('Server is listening on port')
});


