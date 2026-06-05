import multer from 'multer';

// Simple memory storage - no Cloudinary needed
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;