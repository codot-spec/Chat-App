const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
    region: 'eu-north-1'
  });
  

exports.uploads = async (file) => {
    if (!file) {
        return res.status(400).send({ error: 'No file uploaded' });
      }
    
      // The file is in memory (file.buffer), let's send it to S3
      try {
        const s3Response = await s3.upload({
          Bucket: process.env.BUCKET_NAME,
          Key: `${Date.now()}-${file.originalname}`, // Unique file name
          Body: file.buffer, // The file buffer from memory storage
          ContentType: file.mimetype,
          ACL: 'public-read' // Or adjust based on your needs
        }).promise();
    
        return s3Response.Location;
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to upload to S3' });
      }
}

