/**
 * Neon Service
 *
 * Business logic for Neon database operations.
 * This service provides a clean abstraction layer between the IPC handlers
 * and the core business logic for managing Neon projects and branches.
 */

import log from "electron-log";
import {
  getNeonClient,
  getNeonErrorMessage,
  getNeonOrganizationId,
} from "../../neon_admin/neon_management_client";
import { db } from "../../db";
import { apps } from "../../db/schema";
import { eq } from "drizzle-orm";
import { EndpointType } from "@neondatabase/api-client";
import { retryOnLocked } from "../../ipc/utils/retryOnLocked";

const logger = log.scope("neon_service");

/**
 * Parameters for creating a Neon project
 */
export interface CreateNeonProjectParams {
  name: string;
  appId: number;
}

/**
 * Neon project result
 */
export interface NeonProject {
  id: string;
  name: string;
  connectionString: string;
  branchId: string;
}

/**
 * Parameters for getting a Neon project
 */
export interface GetNeonProjectParams {
  appId: number;
}

/**
 * Neon branch information
 */
export interface NeonBranch {
  type: "production" | "development" | "snapshot" | "preview";
  branchId: string;
  branchName: string;
  lastUpdated: string;
  parentBranchId?: string;
  parentBranchName?: string;
}

/**
 * Response for getting a Neon project
 */
export interface GetNeonProjectResponse {
  projectId: string;
  projectName: string;
  orgId: string;
  branches: NeonBranch[];
}

/**
 * Service class for managing Neon database projects
 */
export class NeonService {
  /**
   * Create a new Neon project and configure branches
   */
  async createProject(params: CreateNeonProjectParams): Promise<NeonProject> {
    const { name, appId } = params;
    const neonClient = await getNeonClient();

    logger.info(`Creating Neon project: ${name} for app ${appId}`);

    try {
      // Get the organization ID
      const orgId = await getNeonOrganizationId();

      // Create project with retry on locked errors
      const response = await retryOnLocked(
        () =>
          neonClient.createProject({
            project: {
              name: name,
              org_id: orgId,
            },
          }),
        `Create project ${name} for app ${appId}`,
      );

      if (!response.data.project) {
        throw new Error("Failed to create project: No project data returned.");
      }

      const project = response.data.project;
      const developmentBranch = response.data.branch;

      const previewBranchResponse = await retryOnLocked(
        () =>
          neonClient.createProjectBranch(project.id, {
            endpoints: [{ type: EndpointType.ReadOnly }],
            branch: {
              name: "preview",
              parent_id: developmentBranch.id,
            },
          }),
        `Create preview branch for project ${project.id}`,
      );

      if (
        !previewBranchResponse.data.branch ||
        !previewBranchResponse.data.connection_uris
      ) {
        throw new Error(
          "Failed to create preview branch: No branch data returned.",
        );
      }

      const previewBranch = previewBranchResponse.data.branch;

      // Store project and branch info in the app's DB row
      await db
        .update(apps)
        .set({
          neonProjectId: project.id,
          neonDevelopmentBranchId: developmentBranch.id,
          neonPreviewBranchId: previewBranch.id,
        })
        .where(eq(apps.id, appId));

      logger.info(
        `Successfully created Neon project: ${project.id} and development branch: ${developmentBranch.id} for app ${appId}`,
      );
      return {
        id: project.id,
        name: project.name,
        connectionString: response.data.connection_uris[0].connection_uri,
        branchId: developmentBranch.id,
      };
    } catch (error: any) {
      const errorMessage = getNeonErrorMessage(error);
      const message = `Failed to create Neon project for app ${appId}: ${errorMessage}`;
      logger.error(message);
      throw new Error(message);
    }
  }

  /**
   * Get Neon project information including branches
   */
  async getProject(
    params: GetNeonProjectParams,
  ): Promise<GetNeonProjectResponse> {
    const { appId } = params;
    logger.info(`Getting Neon project info for app ${appId}`);

    try {
      // Get the app from the database to find the neonProjectId and neonBranchId
      const app = await db
        .select()
        .from(apps)
        .where(eq(apps.id, appId))
        .limit(1);

      if (app.length === 0) {
        throw new Error(`App with ID ${appId} not found`);
      }

      const appData = app[0];
      if (!appData.neonProjectId) {
        throw new Error(`No Neon project found for app ${appId}`);
      }

      const neonClient = await getNeonClient();
      console.log("PROJECT ID", appData.neonProjectId);

      // Get project info
      const projectResponse = await neonClient.getProject(
        appData.neonProjectId,
      );

      if (!projectResponse.data.project) {
        throw new Error("Failed to get project: No project data returned.");
      }

      const project = projectResponse.data.project;

      // Get list of branches
      const branchesResponse = await neonClient.listProjectBranches({
        projectId: appData.neonProjectId,
      });

      if (!branchesResponse.data.branches) {
        throw new Error("Failed to get branches: No branch data returned.");
      }

      // Map branches to our format
      const branches: NeonBranch[] = branchesResponse.data.branches.map(
        (branch) => {
          let type: "production" | "development" | "snapshot" | "preview";

          if (branch.default) {
            type = "production";
          } else if (branch.id === appData.neonDevelopmentBranchId) {
            type = "development";
          } else if (branch.id === appData.neonPreviewBranchId) {
            type = "preview";
          } else {
            type = "snapshot";
          }

          // Find parent branch name if parent_id exists
          let parentBranchName: string | undefined;
          if (branch.parent_id) {
            const parentBranch = branchesResponse.data.branches?.find(
              (b) => b.id === branch.parent_id,
            );
            parentBranchName = parentBranch?.name;
          }

          return {
            type,
            branchId: branch.id,
            branchName: branch.name,
            lastUpdated: branch.updated_at,
            parentBranchId: branch.parent_id,
            parentBranchName,
          };
        },
      );

      logger.info(`Successfully retrieved Neon project info for app ${appId}`);

      return {
        projectId: project.id,
        projectName: project.name,
        orgId: project.org_id ?? "<unknown_org_id>",
        branches,
      };
    } catch (error) {
      logger.error(`Failed to get Neon project info for app ${appId}:`, error);
      throw error;
    }
  }
}

/**
 * Singleton instance for easy access
 */
export const neonService = new NeonService();
