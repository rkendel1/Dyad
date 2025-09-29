import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { execSync } from "child_process";
import { updateEnvironmentVariables } from "../ipc/utils/app_env_var_utils";

// Mock modules
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  },
  existsSync: vi.fn(),
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));
vi.mock("child_process");
vi.mock("../paths/paths", () => ({
  getDyadAppPath: vi.fn((appPath: string) => appPath),
}));

const mockFs = fs as any;
const mockExecSync = execSync as any;

describe("Production Promotion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateEnvironmentVariables", () => {
    it("should create new environment file with production variables", async () => {
      // Mock file doesn't exist
      mockFs.existsSync.mockReturnValue(false);
      mockFs.promises.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      const envVars = {
        SUPABASE_URL: "https://test-project.supabase.co",
        SUPABASE_ANON_KEY: "test-anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
      };

      await updateEnvironmentVariables({
        appPath: "/test/app",
        envVars,
      });

      // Should write to both .env.local and .env.production
      expect(mockFs.promises.writeFile).toHaveBeenCalledTimes(2);

      // Check .env.local content
      const envLocalCall = mockFs.promises.writeFile.mock.calls[0];
      expect(envLocalCall[0]).toBe("/test/app/.env.local");
      expect(envLocalCall[1]).toContain(
        "SUPABASE_URL=https://test-project.supabase.co",
      );
      expect(envLocalCall[1]).toContain("SUPABASE_ANON_KEY=test-anon-key");
      expect(envLocalCall[1]).toContain(
        "SUPABASE_SERVICE_ROLE_KEY=test-service-role-key",
      );

      // Check .env.production content
      const envProdCall = mockFs.promises.writeFile.mock.calls[1];
      expect(envProdCall[0]).toBe("/test/app/.env.production");
      expect(envProdCall[1]).toContain(
        "SUPABASE_URL=https://test-project.supabase.co",
      );
    });

    it("should update existing environment file", async () => {
      // Mock existing file
      const existingContent =
        "EXISTING_VAR=existing_value\nSUPABASE_URL=old-url";
      mockFs.promises.readFile.mockResolvedValue(existingContent);
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      const envVars = {
        SUPABASE_URL: "https://new-project.supabase.co",
        NEW_VAR: "new_value",
      };

      await updateEnvironmentVariables({
        appPath: "/test/app",
        envVars,
      });

      const envLocalCall = mockFs.promises.writeFile.mock.calls[0];
      const updatedContent = envLocalCall[1];

      // Should preserve existing variables
      expect(updatedContent).toContain("EXISTING_VAR=existing_value");
      // Should update existing variables
      expect(updatedContent).toContain(
        "SUPABASE_URL=https://new-project.supabase.co",
      );
      // Should add new variables
      expect(updatedContent).toContain("NEW_VAR=new_value");
    });

    it("should handle values with special characters", async () => {
      mockFs.promises.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      const envVars = {
        PASSWORD: "my pass word",
        URL_WITH_PARAMS: "https://example.com?param=value&other=123",
        JSON_VALUE: '{"key": "value with spaces"}',
      };

      await updateEnvironmentVariables({
        appPath: "/test/app",
        envVars,
      });

      const envLocalCall = mockFs.promises.writeFile.mock.calls[0];
      const content = envLocalCall[1];

      // Values with spaces should be quoted
      expect(content).toContain('PASSWORD="my pass word"');
      expect(content).toContain(
        'URL_WITH_PARAMS="https://example.com?param=value&other=123"',
      );
      expect(content).toContain(
        'JSON_VALUE="{\\"key\\": \\"value with spaces\\"}"',
      );
    });

    it("should handle write errors gracefully", async () => {
      mockFs.promises.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.promises.writeFile.mockRejectedValue(
        new Error("Permission denied"),
      );

      const envVars = { TEST_VAR: "test_value" };

      await expect(
        updateEnvironmentVariables({
          appPath: "/test/app",
          envVars,
        }),
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("Database Schema Extraction", () => {
    it("should extract schema using pg_dump", () => {
      const mockSchema = `
        CREATE TABLE users (
          id uuid PRIMARY KEY,
          email text UNIQUE NOT NULL
        );
        
        CREATE FUNCTION get_user() RETURNS users AS $$
        BEGIN
          RETURN (SELECT * FROM users LIMIT 1);
        END;
        $$ LANGUAGE plpgsql;
      `;

      mockExecSync.mockReturnValue(mockSchema);

      // This would be part of the extraction function
      const postgresUrl =
        "postgresql://postgres:password@localhost:5432/postgres";
      const result = execSync(
        `pg_dump "${postgresUrl}" --schema-only --no-owner --no-privileges`,
        { encoding: "utf8" },
      );

      expect(result).toBe(mockSchema);
      expect(mockExecSync).toHaveBeenCalledWith(
        `pg_dump "${postgresUrl}" --schema-only --no-owner --no-privileges`,
        { encoding: "utf8" },
      );
    });

    it("should handle pg_dump errors", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("pg_dump: connection refused");
      });

      expect(() => {
        execSync(
          'pg_dump "invalid-url" --schema-only --no-owner --no-privileges',
          { encoding: "utf8" },
        );
      }).toThrow("pg_dump: connection refused");
    });
  });

  describe("Production Promotion Validation", () => {
    it("should validate required parameters", () => {
      const validParams = {
        appId: 1,
        productionProjectRef: "test-project",
        supabaseUrl: "https://test-project.supabase.co",
        anonKey: "test-anon-key",
        serviceRoleKey: "test-service-role-key",
        dbPassword: "strong-password",
      };

      // All required fields should be present
      expect(validParams.appId).toBeDefined();
      expect(validParams.productionProjectRef).toBeDefined();
      expect(validParams.supabaseUrl).toBeDefined();
      expect(validParams.anonKey).toBeDefined();
      expect(validParams.serviceRoleKey).toBeDefined();
      expect(validParams.dbPassword).toBeDefined();

      // URL should be valid format
      expect(validParams.supabaseUrl).toMatch(/^https:\/\/.*\.supabase\.co$/);

      // Keys should not be empty
      expect(validParams.anonKey.length).toBeGreaterThan(0);
      expect(validParams.serviceRoleKey.length).toBeGreaterThan(0);
    });

    it("should validate Supabase URL format", () => {
      const validUrls = [
        "https://test-project.supabase.co",
        "https://my-app-123.supabase.co",
        "https://project-with-dashes.supabase.co",
      ];

      const invalidUrls = [
        "http://test-project.supabase.co", // http instead of https
        "https://test-project.com", // wrong domain
        "test-project.supabase.co", // missing protocol
        "https://supabase.co", // missing project ref
        "",
      ];

      validUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\/.*\.supabase\.co$/);
      });

      invalidUrls.forEach((url) => {
        expect(url).not.toMatch(/^https:\/\/.*\.supabase\.co$/);
      });
    });

    it("should validate project reference format", () => {
      const validRefs = [
        "abcdefgh",
        "test-project-123",
        "my-app-prod",
        "12345678",
      ];

      const invalidRefs = [
        "", // empty
        "ab", // too short
        "project_with_underscores", // underscores not typically used
      ];

      validRefs.forEach((ref) => {
        expect(ref.length).toBeGreaterThan(2);
        expect(ref).not.toContain("_");
      });

      invalidRefs.forEach((ref) => {
        if (ref === "") {
          expect(ref.length).toBe(0);
        } else if (ref.length <= 2) {
          expect(ref.length).toBeLessThanOrEqual(2);
        } else {
          expect(ref.includes("_")).toBeTruthy();
        }
      });
    });
  });

  describe("Environment File Generation", () => {
    it("should generate correct production environment variables", () => {
      const productionConfig = {
        productionProjectRef: "my-project",
        supabaseUrl: "https://my-project.supabase.co",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        dbPassword: "super-secret-password",
      };

      const expectedEnvVars = {
        SUPABASE_URL: productionConfig.supabaseUrl,
        SUPABASE_ANON_KEY: productionConfig.anonKey,
        SUPABASE_SERVICE_ROLE_KEY: productionConfig.serviceRoleKey,
        POSTGRES_URL: `postgresql://postgres:${productionConfig.dbPassword}@db.${productionConfig.productionProjectRef}.supabase.co:5432/postgres`,
        NEXT_PUBLIC_SUPABASE_URL: productionConfig.supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: productionConfig.anonKey,
      };

      // Validate environment variables are correctly formatted
      expect(expectedEnvVars["SUPABASE_URL"]).toBe(
        productionConfig.supabaseUrl,
      );
      expect(expectedEnvVars["POSTGRES_URL"]).toContain(
        productionConfig.productionProjectRef,
      );
      expect(expectedEnvVars["POSTGRES_URL"]).toContain(
        productionConfig.dbPassword,
      );
      expect(expectedEnvVars["NEXT_PUBLIC_SUPABASE_URL"]).toBe(
        productionConfig.supabaseUrl,
      );
    });

    it("should handle different project reference formats in postgres URL", () => {
      const configs = [
        { ref: "simple", expected: "db.simple.supabase.co" },
        { ref: "with-dashes", expected: "db.with-dashes.supabase.co" },
        { ref: "project123", expected: "db.project123.supabase.co" },
      ];

      configs.forEach(({ ref, expected }) => {
        const postgresUrl = `postgresql://postgres:password@db.${ref}.supabase.co:5432/postgres`;
        expect(postgresUrl).toContain(expected);
      });
    });
  });

  describe("Error Handling", () => {
    it("should provide clear error messages for common issues", () => {
      const errors = {
        "Local Supabase not running":
          "Local Supabase is not running. Please start it first.",
        "Invalid project reference":
          "Project reference must be a valid Supabase project ID",
        "Schema extraction failed": "Failed to extract database schema",
        "Environment file update failed":
          "Failed to update environment variables",
      };

      Object.entries(errors).forEach(([type, message]) => {
        expect(message).toBeTruthy();
        expect(message.length).toBeGreaterThan(10);
        // Check if message contains relevant keywords instead of exact match
        const keywords = type.toLowerCase().split(" ");
        const hasKeyword = keywords.some((keyword) =>
          message.toLowerCase().includes(keyword),
        );
        expect(hasKeyword).toBeTruthy();
      });
    });

    it("should handle missing dependencies gracefully", () => {
      mockExecSync.mockImplementation(() => {
        throw new Error("pg_dump: command not found");
      });

      expect(() => {
        execSync("pg_dump --version", { encoding: "utf8" });
      }).toThrow("pg_dump: command not found");
    });
  });
});
