import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {  //  renamed to fileFilter, 'file' not 'res'
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);  // false outside Error()
  }
};

const upload = multer({ storage, fileFilter });  //  matches name above

export default upload;