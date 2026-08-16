const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const requiredRole = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/mine", authMiddleware, bookingController.getMyBookings);
router.get(
  "/owner",
  authMiddleware,
  requiredRole("owner"),
  bookingController.getOwnerBookings,
);
router.put(
  "/:id",
  authMiddleware,
  requiredRole("owner"),
  bookingController.updateBookingStatus,
);
router.delete("/:id", authMiddleware, bookingController.cancelBooking);
router.post("/:id/messages", authMiddleware, bookingController.addMessage);
router.delete(
  "/:id/messages/:messageId",
  authMiddleware,
  bookingController.deleteMessage,
);

module.exports = router;