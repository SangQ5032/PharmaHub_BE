// src/routes/index.js
import express from "express";

// import các module routes
import authRoutes from "../modules/auth/auth.routes.js";
import usersRoutes from "../modules/users/users.routes.js";
// TODO: thêm các module khác khi tạo tiếp

const router = express.Router();

// mount module routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

// TODO: mount các module khác

export default router;
