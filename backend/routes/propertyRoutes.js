// const express = require("express");
// const router = express.Router();
// const propertyController = require("../controllers/propertyController");
// const authMiddleware = require("../middleware/authMiddleware");
// const requiredRole = require("../middleware/roleMiddleware");

// router.get("/", propertyController.getProperties);
// router.post("/", propertyController.createProperty);
// router.get(
//   "/mine",
//   authMiddleware,
//   requiredRole("owner"),
//   propertyController.getMyProperties,
// );
// router.put(
//   "/:id",
//   authMiddleware,
//   requiredRole("owner"),
//   propertyController.updateProperty,
// );
// router.delete(
//   "/:id",
//   authMiddleware,
//   requiredRole("owner"),
//   propertyController.deleteProperty,
// );

// module.exports = router;

const express = require("express");

const router = express.Router();

const propertyController = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

router.get("/", propertyController.getProperties);

router.post(
  "/",
  authMiddleware,
  requiredRole("owner"),
  upload.array("images", 3),
  propertyController.createProperty
);

router.get(
  "/mine",
  authMiddleware,
  requiredRole("owner"),
  propertyController.getMyProperties
);

router.get(
  "/analytics/owner",
  authMiddleware,
  requiredRole("owner"),
  propertyController.getOwnerAnalytics
);

router.get(
  "/:id",
  optionalAuthMiddleware,
  propertyController.getPropertyById
);

router.put(
  "/:id",
  authMiddleware,
  requiredRole("owner"),
  upload.array("images", 3),
  propertyController.updateProperty
);

router.delete(
  "/:id",
  authMiddleware,
  requiredRole("owner"),
  propertyController.deleteProperty
);

module.exports = router;