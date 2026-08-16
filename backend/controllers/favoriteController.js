const Favorite = require("../schemas/favorite");
const Property = require("../schemas/property");

exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    const userRole = req.user && req.user.role;
    const { propertyId } = req.params;

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (userRole !== "tenant") {
      return res.status(403).json({
        success: false,
        message: "Only tenants can save properties",
      });
    }

    const property = await Property.findById(propertyId).lean();
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });

    const existing = await Favorite.findOne({ userId, propertyId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true, saved: false });
    }

    await Favorite.create({ userId, propertyId });
    return res.status(201).json({ success: true, saved: true });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update favorite" });
  }
};

exports.getMyFavoriteIds = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const favorites = await Favorite.find({ userId })
      .select("propertyId")
      .lean();
    const ids = favorites.map((f) => String(f.propertyId));

    return res.status(200).json({ success: true, ids });
  } catch (error) {
    console.error("Get favorite ids error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch favorites" });
  }
};

exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    const detailed = await Promise.all(
      favorites.map(async (f) => {
        const property = await Property.findById(f.propertyId).lean();
        return property ? { ...property, favoritedAt: f.createdAt } : null;
      }),
    );

    return res
      .status(200)
      .json({ success: true, properties: detailed.filter(Boolean) });
  } catch (error) {
    console.error("Get my favorites error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch favorites" });
  }
};