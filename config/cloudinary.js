const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log(" Cloudinary Configuration Loaded");
} else {
    console.log(" Warning: Cloudinary environment variables are missing!");
}

module.exports = cloudinary;