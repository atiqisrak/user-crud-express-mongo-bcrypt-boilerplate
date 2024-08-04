const mongoose = require("mongoose");
const Role = require("./models/Role");
const Permission = require("./models/Permission");
const dotenv = require("dotenv");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    const permissions = ["create", "read", "update", "delete"];
    for (const permissionName of permissions) {
      let permission = await Permission.findOne({ name: permissionName });
      if (!permission) {
        permission = new Permission({ name: permissionName });
        await permission.save();
        console.log(`Permission ${permissionName} created`);
      }
    }

    let superadminRole = await Role.findOne({ name: "superadmin" });
    if (!superadminRole) {
      const allPermissions = await Permission.find({});
      superadminRole = new Role({
        name: "superadmin",
        permissions: allPermissions.map((perm) => perm._id),
      });
      await superadminRole.save();
      console.log("Superadmin role created with all permissions");
    }

    console.log("Initial setup completed");
    process.exit();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
