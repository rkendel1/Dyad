/**
 * Proposal Controller
 *
 * HTTP endpoints for proposal management (get, approve, reject)
 */

import type { Response } from "express";
import type { ApiRequest, ApiResponse } from "../types";
import { asyncHandler, HttpApiError } from "../middleware/errorHandler";
import { ProposalService } from "../../api/services/proposal.service";

const proposalService = new ProposalService();

/**
 * GET /api/chats/:chatId/proposal
 * Get proposal for a chat (if any)
 */
export const getProposal = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const chatId = parseInt(req.params.chatId, 10);

    if (isNaN(chatId)) {
      throw new HttpApiError("Invalid chat ID", 400, "INVALID_CHAT_ID");
    }

    const proposal = await proposalService.getProposal(chatId);

    const response: ApiResponse = {
      success: true,
      data: proposal,
    };

    res.json(response);
  },
);

/**
 * POST /api/chats/:chatId/proposal/approve
 * Approve a proposal
 */
export const approveProposal = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const chatId = parseInt(req.params.chatId, 10);
    const { messageId } = req.body;

    if (isNaN(chatId)) {
      throw new HttpApiError("Invalid chat ID", 400, "INVALID_CHAT_ID");
    }

    if (!messageId || isNaN(parseInt(messageId, 10))) {
      throw new HttpApiError("Invalid message ID", 400, "INVALID_MESSAGE_ID");
    }

    const result = await proposalService.approveProposal(
      chatId,
      parseInt(messageId, 10),
    );

    const response: ApiResponse = {
      success: true,
      data: result,
    };

    res.json(response);
  },
);

/**
 * POST /api/chats/:chatId/proposal/reject
 * Reject a proposal
 */
export const rejectProposal = asyncHandler(
  async (req: ApiRequest, res: Response) => {
    const chatId = parseInt(req.params.chatId, 10);
    const { messageId } = req.body;

    if (isNaN(chatId)) {
      throw new HttpApiError("Invalid chat ID", 400, "INVALID_CHAT_ID");
    }

    if (!messageId || isNaN(parseInt(messageId, 10))) {
      throw new HttpApiError("Invalid message ID", 400, "INVALID_MESSAGE_ID");
    }

    await proposalService.rejectProposal(chatId, parseInt(messageId, 10));

    const response: ApiResponse = {
      success: true,
      data: {
        message: "Proposal rejected successfully",
        chatId,
        messageId: parseInt(messageId, 10),
      },
    };

    res.json(response);
  },
);
