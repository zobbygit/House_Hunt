const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/:propertyId",
  authMiddleware,
  favoriteController.toggleFavorite,
);
router.get("/mine", authMiddleware, favoriteController.getMyFavorites);
router.get(
  "/mine/ids",
  authMiddleware,
  favoriteController.getMyFavoriteIds,
);

module.exports = router;