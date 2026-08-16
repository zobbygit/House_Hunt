require("dotenv").config({ path: "../.env" });

const cloudinary = require("../config/cloudinary");

cloudinary.uploader.upload(
  "./test.jpg",
  {
    folder: "house_hunt/test",
  },
  (error, result) => {
    if (error) {
      console.error("❌ Cloudinary upload failed:");
      console.error(error);
      return;
    }

    console.log("✅ Cloudinary upload successful!");
    console.log("URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  }
);