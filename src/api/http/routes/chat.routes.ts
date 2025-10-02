/**
 * Chat Routes
 *
 * Chat and message management endpoints
 */

import { Router } from "express";
import * as chatController from "../controllers/chat.controller";
import * as proposalController from "../controllers/proposal.controller";
import { validateBody } from "../middleware/validation";

const router = Router();

/**
 * Chat endpoints
 */

/**
 * GET /api/chats/:id - Get chat by ID
 */
router.get("/:id", chatController.getChat);

/**
 * PUT /api/chats/:id - Update chat
 */
router.put(
  "/:id",
  validateBody(chatController.updateChatSchema),
  chatController.updateChat,
);

/**
 * DELETE /api/chats/:id - Delete chat
 */
router.delete("/:id", chatController.deleteChat);

/**
 * GET /api/chats/:id/messages - Get chat messages
 */
router.get("/:id/messages", chatController.getChatMessages);

/**
 * POST /api/chats/:id/messages - Create message
 */
router.post(
  "/:id/messages",
  validateBody(chatController.createMessageSchema),
  chatController.createMessage,
);

/**
 * GET /api/chats/:chatId/proposal - Get proposal for chat
 */
router.get("/:chatId/proposal", proposalController.getProposal);

/**
 * POST /api/chats/:chatId/proposal/approve - Approve proposal
 */
router.post("/:chatId/proposal/approve", proposalController.approveProposal);

/**
 * POST /api/chats/:chatId/proposal/reject - Reject proposal
 */
router.post("/:chatId/proposal/reject", proposalController.rejectProposal);

/**
 * App-specific chat endpoints
 * These are mounted at /api/apps/:appId/chats in the main router
 */

/**
 * GET /api/apps/:appId/chats - List chats for app
 */
export const listChatsForApp = chatController.listChats;

/**
 * POST /api/apps/:appId/chats - Create chat for app
 */
export const createChatForApp = chatController.createChat;

export default router;
