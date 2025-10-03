/**
 * Template Service
 *
 * Business logic for template management
 */

import { localTemplatesData, type Template } from "../../shared/templates";

/**
 * Service class for managing templates
 */
export class TemplateService {
  /**
   * List all available templates
   */
  async listTemplates(): Promise<Template[]> {
    // Return local templates data
    // In the future, this could be extended to fetch from an external API
    return localTemplatesData;
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<Template> {
    const template = localTemplatesData.find((t) => t.id === templateId);

    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    return template;
  }
}
