const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());

// AWS SDK Configuration
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/analyze', upload.single('image'), async (req, res) => {
  const file = req.file;

  const s3Params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: file.originalname,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype
  };

  s3.upload(s3Params, (err, uploadData) => {
    if (err) return res.status(500).json({ error: err });

    const imageBytes = fs.readFileSync(file.path);

    const rekognitionParams = {
      Image: { Bytes: imageBytes }
    };

    const results = {};

    rekognition.detectLabels({ ...rekognitionParams, MaxLabels: 10 }, (err, labelData) => {
      if (err) return res.status(500).json({ error: err });

      results.labels = labelData.Labels;

      rekognition.detectFaces({ ...rekognitionParams, Attributes: ['ALL'] }, (err, faceData) => {
        if (err) return res.status(500).json({ error: err });

        results.faces = faceData.FaceDetails;

        rekognition.detectText(rekognitionParams, (err, textData) => {
          if (err) return res.status(500).json({ error: err });

          fs.unlinkSync(file.path); // Delete local file

          results.text = textData.TextDetections;
          results.s3Url = uploadData.Location;

          res.json(results);
        });
      });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
