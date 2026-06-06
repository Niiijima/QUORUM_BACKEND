import multer from 'multer';
import * as cloudinaryStoragePackage from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

// Access the class via the default/named property
const CloudinaryStorage = cloudinaryStoragePackage.CloudinaryStorage || cloudinaryStoragePackage.default.CloudinaryStorage;

console.log("Configuring Cloudinary Storage for Multer...");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'quorum_uploads',
    format: async (req, file) => 'png',
    public_id: (req, file) => Date.now().toString(),
  },
});

const upload = multer({ storage });

export default upload;