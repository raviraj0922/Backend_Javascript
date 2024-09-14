import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null
            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto'
            })
            //file is uploaded on cloudinary
            console.log("file is upoaded on cloudinary", response.url);
            return response;
        } catch (error) {
            fs.unlinkSync(localFilePath) //if uploaded got failed it will remove from locally temp
            return null;
        }
    }

export {uploadOnCloudinary}