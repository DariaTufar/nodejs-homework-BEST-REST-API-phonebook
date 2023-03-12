const express = require("express");

const router = express.Router();

const ctrl = require("../../controllers/users")

const { validateBody, authenticate, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");

// =============Registration of a user = Sign-Up ============================
 
router.post("/signup", validateBody(schemas.schemaSignUp), ctrl.signup  );

// =============Sign in =====================================================

router.post("/login", validateBody(schemas.schemaLogin), ctrl.login);

// =============Current User ================================================

router.get("/current", authenticate, ctrl.getCurrent);

// =============Log Out =====================================================

router.post("/logout",  authenticate, ctrl.logout);

// =============Adding Avatars===========================
 
router.patch("/avatars",  authenticate,  upload.single("avatar"),  ctrl.updateAvatar);

module.exports = router;