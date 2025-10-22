  import express from "express";
  import {
    broadcastNotification,
    getNotifications,
    markAsRead,
  } from "../controller/notificationController";

  const router = express.Router();

  router.post("/broadcast", broadcastNotification);
  router.get("/:userId", getNotifications);
  router.patch("/:id/read", markAsRead);

  export default router;
