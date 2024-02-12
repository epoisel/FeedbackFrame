const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
// Allows requests from any origin; for development purposes only
app.use(cors());
// Enable express to parse JSON body content
app.use(express.json());
const admin = require('firebase-admin');
const serviceAccount = require('path/to/serviceAccountKey.json');


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const UPLOADS_METADATA_FILE = path.join(__dirname, 'uploads.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
   
  });


// Define allowed file types
const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'application/pdf', 
    'image/vnd.adobe.photoshop', // MIME type for Photoshop files
    'application/postscript', // MIME type for Illustrator files (.ai files)
    
    'image/gif'
];

// File filter function for multer
const fileFilter = (req, file, cb) => {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const allowedExtensions = ['psd', 'ai', 'jpg', 'jpeg', 'png', 'gif', 'procreate'];
    if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
        cb(new Error('Invalid file type.'), false);
    } else {
        cb(null, true);
    }
};

// Custom storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Files will be saved in the 'uploads' directory
    },
    filename: function(req, file, cb) {
        //  Unique filename for the uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

// Initialize multer with the custom storage configuration
const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

app.post('/upload', upload.fields([{ name: 'artwork', maxCount: 1 }, { name: 'preview', maxCount: 1 }]), (req, res) => {
    const user = req.body.user; // "User 1" or "User 2"
    const files = req.files;
    const metadata = {
        artwork: files.artwork[0].filename,
        preview: files.preview[0].filename,
        user: user,
        timestamp: new Date().toISOString(),
    };

    // Read existing uploads and append new one
    fs.readFile(UPLOADS_METADATA_FILE, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, create a new one
                fs.writeFile(UPLOADS_METADATA_FILE, JSON.stringify([metadata]), (err) => {
                    if (err) {
                        console.error('Error creating uploads.json:', err);
                        return res.status(500).send('Error creating uploads.json.');
                    }
                    console.log('Metadata saved.');
                });
            } else {
                console.error('Error reading uploads.json:', err);
                return res.status(500).send('Error reading uploads.json.');
            }
        } else {
            try {
                const uploads = JSON.parse(data);
                uploads.push(metadata);
                fs.writeFile(UPLOADS_METADATA_FILE, JSON.stringify(uploads), (err) => {
                    if (err) {
                        console.error('Error updating uploads.json:', err);
                        return res.status(500).send('Error updating uploads.json.');
                    }
                    console.log('Metadata updated.');
                });
            } catch (parseError) {
                console.error('Error parsing uploads.json:', parseError);
                return res.status(500).send('Error parsing uploads.json.');
            }
        }
    });

    res.send('File uploaded successfully!');
})

// New GET route to serve the list of uploads
app.get('/uploads', (req, res) => {
    fs.readFile(UPLOADS_METADATA_FILE, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found, return empty list
                return res.json([]);
            }
            return res.status(500).send('Error reading upload metadata.');
        }
        res.json(JSON.parse(data));
    });
});

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
