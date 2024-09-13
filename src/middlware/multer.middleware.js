import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname) //originalname can be overwrite the file
    }
  })
  
  export const upload = multer({ 
    storage,
})