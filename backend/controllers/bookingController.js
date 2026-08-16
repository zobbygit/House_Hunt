const Booking = require("../schemas/booking");
const Property = require("../schemas/property");
const User = require("../schemas/user");

async function resolvePropertyOwner(property) {
  if (!property) {
    return null;
  }

  if (property.ownerId) {
    return {
      ownerId: property.ownerId,
      ownerName: property.ownerName || "",
      ownerContact: property.ownerContact ? String(property.ownerContact) : "",
    };
  }

  const fallbackOwner = await User.findOne({ role: "owner" })
    .select("_id name")
    .lean();

  if (!fallbackOwner) {
    return {
      ownerId: null,
      ownerName: property.ownerName || "",
      ownerContact: property.ownerContact ? String(property.ownerContact) : "",
    };
  }

  return {
    ownerId: fallbackOwner._id,
    ownerName: property.ownerName || fallbackOwner.name || "",
    ownerContact: property.ownerContact ? String(property.ownerContact) : "",
  };
}

exports.createBooking = async (req, res) => {
  try {
    const { propertyId, phone, userName, message } = req.body;
    const userId = req.user && req.user.id;
    const userRole = req.user && req.user.role;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    if (userRole !== "tenant") {
      return res
        .status(403)
        .json({ success: false, message: "Only tenants can create bookings" });
    }
    if (!propertyId || !phone || !userName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing booking fields" });
    }

    const property = await Property.findById(propertyId).lean();
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    const duplicateBooking = await Booking.findOne({
      propertyId,
      userId,
      bookingStatus: { $in: ["pending", "accepted"] },
    }).lean();

    if (duplicateBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking request for this property",
      });
    }

    const resolvedOwner = await resolvePropertyOwner(property);

    const booking = await Booking.create({
      propertyId,
      ownerId: resolvedOwner?.ownerId || null,
      ownerName: resolvedOwner?.ownerName || "",
      ownerContact: resolvedOwner?.ownerContact || "",
      userId,
      userName,
      phone: String(phone),
      bookingStatus: "pending",
      message: message || "",
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error("Create booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create booking" });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user && req.user.id;
    if (!ownerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const ownedProperties = await Property.find().lean();

    const matchingPropertyIds = [];
    for (const property of ownedProperties) {
      const resolvedOwner = await resolvePropertyOwner(property);
      if (String(resolvedOwner?.ownerId || "") === String(ownerId)) {
        matchingPropertyIds.push(property._id);
      }
    }

    const bookings = await Booking.find({
      $or: [{ ownerId }, { propertyId: { $in: matchingPropertyIds } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const detailed = await Promise.all(
      bookings.map(async (b) => {
        const prop = await Property.findById(b.propertyId).lean();
        return { ...b, property: prop || null };
      }),
    );

    return res.status(200).json({ success: true, bookings: detailed });
  } catch (error) {
    console.error("Get owner bookings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const detailed = await Promise.all(
      bookings.map(async (b) => {
        const prop = await Property.findById(b.propertyId).lean();
        return { ...b, property: prop || null };
      }),
    );

    return res.status(200).json({ success: true, bookings: detailed });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const ownerId = req.user && req.user.id;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected",
      });
    }
    const existing = await Booking.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const property = await Property.findById(existing.propertyId).lean();
    const resolvedOwner = await resolvePropertyOwner(property);
    const isOwnedByUser =
      String(existing.ownerId) === String(ownerId) ||
      String(resolvedOwner?.ownerId || "") === String(ownerId);

    if (!isOwnedByUser) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    existing.bookingStatus = status || existing.bookingStatus;
    await existing.save();
    return res.status(200).json({ success: true, booking: existing });
  } catch (error) {
    console.error("Update booking status error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update booking" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user && req.user.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const existing = await Booking.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // Only the tenant who created this booking can cancel it.
    if (String(existing.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Once the owner has made a decision, it's no longer withdrawable —
    // only a still-pending request can be cancelled.
    if (existing.bookingStatus !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending bookings can be cancelled",
      });
    }

    await Booking.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to cancel booking" });
  }
};

exports.addMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const { text } = req.body;
    const userId = req.user && req.user.id;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!text || !String(text).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required" });
    }

    const existing = await Booking.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    const isTenant = String(existing.userId) === String(userId);

    let isOwner = String(existing.ownerId) === String(userId);
    if (!isOwner) {
      const property = await Property.findById(existing.propertyId).lean();
      const resolvedOwner = await resolvePropertyOwner(property);
      isOwner = String(resolvedOwner?.ownerId || "") === String(userId);
    }

    if (!isTenant && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const senderRole = isTenant ? "tenant" : "owner";
    const senderName = isTenant
      ? existing.userName
      : existing.ownerName || "Owner";

    existing.messages.push({
      senderId: userId,
      senderRole,
      senderName,
      text: String(text).trim(),
    });

    await existing.save();

    return res.status(201).json({ success: true, booking: existing });
  } catch (error) {
    console.error("Add booking message error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send message" });
  }
};


// exports.deleteMessage = async (req, res) => {
//   try {
//     const { id, messageId } = req.params;
//     const userId = req.user && req.user.id;

//     if (!userId)
//       return res.status(401).json({ success: false, message: "Unauthorized" });

//     const existing = await Booking.findById(id);
//     if (!existing)
//       return res
//         .status(404)
//         .json({ success: false, message: "Booking not found" });

//     const targetMessage = existing.messages.id(messageId);
//     if (!targetMessage)
//       return res
//         .status(404)
//         .json({ success: false, message: "Message not found" });

//     // Only the person who sent a message can delete it.
//     if (String(targetMessage.senderId) !== String(userId)) {
//       return res
//         .status(403)
//         .json({ success: false, message: "You can only delete your own messages" });
//     }

//     existing.messages.pull({ _id: messageId });
//     await existing.save();

//     return res.status(200).json({ success: true, booking: existing });
//   } catch (error) {
//     console.error("Delete booking message error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to delete message" });
//   }
// };





// exports.deleteMessage = async (req, res) => {
//   try {
//     const { id, messageId } = req.params;
//     const userId = req.user?.id || req.user?._id;

//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const booking = await Booking.findById(id);

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: "Booking not found",
//       });
//     }

//     const message = booking.messages.id(messageId);

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found",
//       });
//     }

//     // Only the sender can delete their own message
//     if (String(message.senderId) !== String(userId)) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only delete your own messages",
//       });
//     }

//     message.deleteOne();

//     await booking.save();

//     return res.status(200).json({
//       success: true,
//       message: "Message deleted successfully",
//       booking,
//     });
//   } catch (error) {
//     console.error("Delete booking message error:", error);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Failed to delete message",
//     });
//   }
// };






exports.deleteMessage = async (req, res) => {
  try {
    const { id, messageId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const targetMessage = booking.messages.id(messageId);

    if (!targetMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // 🔍 DEBUG LOGS — ADD THEM HERE
    // console.log("========== DELETE MESSAGE ==========");
    // console.log("Booking ID:", id);
    // console.log("Message ID:", messageId);
    // console.log("Logged-in User ID:", userId);
    // console.log("Message Sender ID:", targetMessage.senderId);
    // console.log(
    //   "IDs Match:",
    //   String(targetMessage.senderId) === String(userId)
    // );
    // console.log("====================================");

    // Only the sender can delete their own message
    if (String(targetMessage.senderId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    targetMessage.deleteOne();

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking message error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message",
    });
  }
};