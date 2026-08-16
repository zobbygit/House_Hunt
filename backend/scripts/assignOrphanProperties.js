// One-off fix: assigns any property with a missing/null ownerId to the
// single existing owner account. Only safe to run when there is exactly
// one owner in the system — the script will refuse to run otherwise.
//
// Usage:
//   node scripts/assignOrphanProperties.js         (dry run, no changes)
//   node scripts/assignOrphanProperties.js --apply  (writes changes)

require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("../schemas/property");
const User = require("../schemas/user");

async function run() {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in .env");

  await mongoose.connect(uri);

  const owners = await User.find({ role: "owner" }).select("_id name").lean();

  if (owners.length === 0) {
    throw new Error("No owner accounts found. Nothing to assign to.");
  }
  if (owners.length > 1) {
    throw new Error(
      `Found ${owners.length} owner accounts — this script only supports the single-owner case. Use assignOwnerToProperties.js instead.`,
    );
  }

  const owner = owners[0];

  const orphans = await Property.find({
    $or: [{ ownerId: { $exists: false } }, { ownerId: null }],
  })
    .select("_id propertyAddress propertyType ownerName")
    .lean();

  console.log("Assign orphan properties report");
  console.log("--------------------------------");
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`Owner: ${owner.name || "(no name)"} (${owner._id})`);
  console.log(`Orphan properties found: ${orphans.length}`);

  for (const p of orphans) {
    console.log(
      ` - ${p._id} | ${p.propertyType || "?"} | ${p.propertyAddress || "(no address)"}`,
    );
  }

  if (!apply) {
    console.log("\nDry-run complete. No DB changes were made.");
    await mongoose.disconnect();
    return;
  }

  if (orphans.length === 0) {
    console.log("\nNothing to update.");
    await mongoose.disconnect();
    return;
  }

  const result = await Property.updateMany(
    { $or: [{ ownerId: { $exists: false } }, { ownerId: null }] },
    { $set: { ownerId: owner._id, ownerName: owner.name || "" } },
  );

  console.log("\nApply complete.");
  console.log(`Matched: ${result.matchedCount}`);
  console.log(`Modified: ${result.modifiedCount}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // no-op
  }
  process.exit(1);
});