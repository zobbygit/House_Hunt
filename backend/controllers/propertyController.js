// const Property = require("../schemas/property");
// const User = require("../schemas/user");
// const Booking = require("../schemas/booking");

// exports.getProperties = async (req, res) => {
//   try {
//     const q = (req.query.q || "").trim();
//     const filter = q
//       ? {
//           $or: [
//             { propertyAddress: { $regex: q, $options: "i" } },
//             { propertyType: { $regex: q, $options: "i" } },
//             { ownerName: { $regex: q, $options: "i" } },
//             { additionalInfo: { $regex: q, $options: "i" } },
//           ],
//         }
//       : {};

//     const properties = await Property.find(filter).limit(100).lean();

//     return res.status(200).json({ success: true, properties });
//   } catch (error) {
//     console.error("Get properties error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch properties" });
//   }
// };

// exports.createProperty = async (req, res) => {
//   try {
//     const payload = req.body || {};
//     // attach ownerId when available (authenticated owner)
//     console.log("DEBUG req.user in createProperty:", req.user);
//     if (req.user && req.user.id) {
//       payload.ownerId = req.user.id;
//       const owner = await User.findById(req.user.id).select("name").lean();
//       if (owner && owner.name) {
//         payload.ownerName = owner.name;
//       }
//     }
//     const created = await Property.create(payload);
//     return res.status(201).json({ success: true, property: created });
//   } catch (error) {
//     console.error("Create property error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to create property" });
//   }
// };

// exports.getMyProperties = async (req, res) => {
//   try {
//     const ownerId = req.user && req.user.id;
//     if (!ownerId)
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     // Only return properties where ownerId matches the authenticated user.
//     const filter = { ownerId };
//     const properties = await Property.find(filter).lean();
//     return res.status(200).json({ success: true, properties });
//   } catch (error) {
//     console.error("Get my properties error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch properties" });
//   }
// };

// exports.updateProperty = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const ownerId = req.user && req.user.id;
//     const existing = await Property.findById(id);
//     if (!existing)
//       return res
//         .status(404)
//         .json({ success: false, message: "Property not found" });
//     // allow update only when ownerId matches the authenticated user
//     if (!existing.ownerId || String(existing.ownerId) !== String(ownerId)) {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }

//     Object.assign(existing, req.body);
//     if (ownerId) {
//       const owner = await User.findById(ownerId).select("name").lean();
//       if (owner && owner.name) {
//         existing.ownerName = owner.name;
//       }
//     }
//     await existing.save();
//     return res.status(200).json({ success: true, property: existing });
//   } catch (error) {
//     console.error("Update property error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to update property" });
//   }
// };

// exports.deleteProperty = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const ownerId = req.user && req.user.id;
//     const existing = await Property.findById(id);
//     if (!existing)
//       return res
//         .status(404)
//         .json({ success: false, message: "Property not found" });
//     // allow delete only when ownerId matches the authenticated user
//     if (!existing.ownerId || String(existing.ownerId) !== String(ownerId)) {
//       return res.status(403).json({ success: false, message: "Forbidden" });
//     }

//     // Prevent deletion when there are pending or accepted bookings for this property
//     const activeBooking = await Booking.findOne({
//       propertyId: id,
//       bookingStatus: { $in: ["pending", "accepted"] },
//     }).lean();

//     if (activeBooking) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "Cannot delete property with active bookings (pending or accepted)",
//       });
//     }

//     await Property.deleteOne({ _id: id });
//     return res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Delete property error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to delete property" });
//   }
// };

const Property = require("../schemas/property");
const User = require("../schemas/user");
const Booking = require("../schemas/booking");
const Favorite = require("../schemas/favorite");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "house_hunt/properties" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function uploadImagesToCloudinary(files) {
  const uploads = files.map((file) => uploadBufferToCloudinary(file.buffer));
  return Promise.all(uploads);
}

async function deleteImagesFromCloudinary(images) {
  if (!images || images.length === 0) return;
  await Promise.all(
    images.map((img) =>
      cloudinary.uploader.destroy(img.publicId).catch((err) => {
        console.error("Cloudinary delete failed:", img.publicId, err.message);
      }),
    ),
  );
}

exports.getProperties = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const type = (req.query.type || "").trim();
    const adType = (req.query.adType || "").trim();
    const minPrice =
      req.query.minPrice !== undefined && req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : null;
    const maxPrice =
      req.query.maxPrice !== undefined && req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : null;

    const andConditions = [];

    if (q) {
      const safeQ = escapeRegex(q);
      andConditions.push({
        $or: [
          { propertyAddress: { $regex: safeQ, $options: "i" } },
          { propertyType: { $regex: safeQ, $options: "i" } },
          { ownerName: { $regex: safeQ, $options: "i" } },
          { additionalInfo: { $regex: safeQ, $options: "i" } },
        ],
      });
    }

    if (type) {
      andConditions.push({
        propertyType: { $regex: `^${escapeRegex(type)}$`, $options: "i" },
      });
    }

    if (adType) {
      andConditions.push({
        propertyAdType: { $regex: `^${escapeRegex(adType)}$`, $options: "i" },
      });
    }

    if (minPrice !== null && !Number.isNaN(minPrice)) {
      andConditions.push({ propertyAmt: { $gte: minPrice } });
    }

    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      andConditions.push({ propertyAmt: { $lte: maxPrice } });
    }

    // Hide properties the owner has marked unavailable (Rented/Sold).
    andConditions.push({ isAvailable: { $ne: false } });

    const filter = andConditions.length ? { $and: andConditions } : {};

    const properties = await Property.find(filter).limit(100).lean();

    return res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Get properties error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const id = req.params.id;
    const property = await Property.findById(id);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    const isOwnerViewing =
      req.user && String(req.user.id) === String(property.ownerId);

    if (!isOwnerViewing) {
      property.views = (property.views || 0) + 1;
      await property.save();
    }

    return res.status(200).json({ success: true, property });
  } catch (error) {
    console.error("Get property by id error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch property" });
  }
};

exports.getOwnerAnalytics = async (req, res) => {
  try {
    const ownerId = req.user && req.user.id;
    if (!ownerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const properties = await Property.find({ ownerId }).lean();
    const propertyIds = properties.map((p) => p._id);

    let forSaleCount = 0;
    let forRentCount = 0;
    properties.forEach((p) => {
      if (String(p.propertyAdType || "").toLowerCase() === "sale") {
        forSaleCount += 1;
      } else {
        forRentCount += 1;
      }
    });

    const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);

    const favoriteCounts = await Favorite.aggregate([
      { $match: { propertyId: { $in: propertyIds } } },
      { $group: { _id: "$propertyId", count: { $sum: 1 } } },
    ]);
    const totalFavorites = favoriteCounts.reduce((sum, f) => sum + f.count, 0);
    const favoriteMap = {};
    favoriteCounts.forEach((f) => {
      favoriteMap[String(f._id)] = f.count;
    });

    const acceptedBookings = await Booking.find({
      propertyId: { $in: propertyIds },
      bookingStatus: "accepted",
    })
      .select("propertyId userName")
      .lean();

    const pendingCount = await Booking.countDocuments({
      propertyId: { $in: propertyIds },
      bookingStatus: "pending",
    });

    const bookedByProperty = {};
    acceptedBookings.forEach((b) => {
      const pid = String(b.propertyId);
      if (!bookedByProperty[pid]) bookedByProperty[pid] = [];
      bookedByProperty[pid].push(b.userName);
    });

    const perProperty = properties.map((p) => ({
      _id: p._id,
      propertyType: p.propertyType,
      propertyAddress: p.propertyAddress,
      propertyAdType: p.propertyAdType,
      views: p.views || 0,
      favorites: favoriteMap[String(p._id)] || 0,
      bookedBy: bookedByProperty[String(p._id)] || [],
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalProperties: properties.length,
        totalViews,
        totalFavorites,
        totalBooked: acceptedBookings.length,
        totalPending: pendingCount,
        forSaleCount,
        forRentCount,
      },
      properties: perProperty,
    });
  } catch (error) {
    console.error("Get owner analytics error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const payload = req.body || {};
    // attach ownerId when available (authenticated owner)
    if (req.user && req.user.id) {
      payload.ownerId = req.user.id;
      const owner = await User.findById(req.user.id).select("name").lean();
      if (owner && owner.name) {
        payload.ownerName = owner.name;
      }
    }

    if (req.files && req.files.length > 0) {
      payload.propertyImages = await uploadImagesToCloudinary(req.files);
    }

    const created = await Property.create(payload);
    return res.status(201).json({ success: true, property: created });
  } catch (error) {
    console.error("Create property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create property" });
  }
};

exports.getMyProperties = async (req, res) => {
  try {
    const ownerId = req.user && req.user.id;
    if (!ownerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    // Only return properties where ownerId matches the authenticated user.
    const filter = { ownerId };
    const properties = await Property.find(filter).lean();
    return res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("Get my properties error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch properties" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = req.user && req.user.id;
    const existing = await Property.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    // allow update only when ownerId matches the authenticated user
    if (!existing.ownerId || String(existing.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    Object.assign(existing, req.body);
    if (ownerId) {
      const owner = await User.findById(ownerId).select("name").lean();
      if (owner && owner.name) {
        existing.ownerName = owner.name;
      }
    }

    // Only touch images if new ones were actually uploaded — resubmitting
    // the edit form without picking new photos should leave them alone.
    if (req.files && req.files.length > 0) {
      await deleteImagesFromCloudinary(existing.propertyImages);
      existing.propertyImages = await uploadImagesToCloudinary(req.files);
    }

    await existing.save();
    return res.status(200).json({ success: true, property: existing });
  } catch (error) {
    console.error("Update property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update property" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = req.user && req.user.id;
    const existing = await Property.findById(id);
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    // allow delete only when ownerId matches the authenticated user
    if (!existing.ownerId || String(existing.ownerId) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Prevent deletion when there are pending or accepted bookings for this property
    const activeBooking = await Booking.findOne({
      propertyId: id,
      bookingStatus: { $in: ["pending", "accepted"] },
    }).lean();

    if (activeBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete property with active bookings (pending or accepted)",
      });
    }

    // Clean up any uploaded images so they don't sit orphaned in Cloudinary.
    await deleteImagesFromCloudinary(existing.propertyImages);

    await Property.deleteOne({ _id: id });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete property error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete property" });
  }
};