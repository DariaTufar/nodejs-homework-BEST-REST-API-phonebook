const express = require("express");
const router = express.Router();

const ctrl = require("../../controllers/contacts");
const { validateBody, isValidId, authenticate } = require("../../middlewares");
const { schemas } = require("../../models/contact");


// ===========getting List of All Contacts =================

router.get("/", authenticate, ctrl.getAllContacts);

// ============Getting a given Contact by  ID ===============

router.get("/:contactId", authenticate, isValidId, ctrl.getContactById);

// =============Adding a Contact =============================

router.post("/", authenticate,  validateBody(schemas.schemaPut), ctrl.addContact);

// ============ Deleting  a Contact ==========================

router.delete("/:contactId", authenticate, isValidId, ctrl.removeContact );

// ==============Updating a Contact ===========================

router.put("/:contactId",authenticate,  isValidId, validateBody(schemas.schemaPut), ctrl.updateContact );

// ==============Favorite status update ============

router.patch(
  "/:contactId/favorite",
  authenticate,
  isValidId,
  validateBody(schemas.schemaPatch),
  ctrl.updateFavorite
);

module.exports = router;
