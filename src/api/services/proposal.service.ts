/**
 * Proposal Service
 *
 * Business logic for proposal operations (get, approve, reject).
 * This service wraps the IPC handler logic for HTTP API access.
 */

import { IpcClient } from "../../ipc/ipc_client";
import type { ProposalResult } from "../../lib/schemas";
import type { ApproveProposalResult } from "../../ipc/ipc_types";

/**
 * Service class for managing proposals
 */
export class ProposalService {
  private ipcClient: IpcClient;

  constructor() {
    this.ipcClient = IpcClient.getInstance();
  }

  /**
   * Get proposal for a chat (if any)
   */
  async getProposal(chatId: number): Promise<ProposalResult | null> {
    return await this.ipcClient.invoke("get-proposal", { chatId });
  }

  /**
   * Approve a proposal
   */
  async approveProposal(
    chatId: number,
    messageId: number,
  ): Promise<ApproveProposalResult> {
    return await this.ipcClient.invoke("approve-proposal", {
      chatId,
      messageId,
    });
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(chatId: number, messageId: number): Promise<void> {
    return await this.ipcClient.invoke("reject-proposal", {
      chatId,
      messageId,
    });
  }
}

/**
 * Singleton instance for easy access
 */
export const proposalService = new ProposalService();
