import { db } from "../../db";
import { messages } from "../../db/schema";
import { eq } from "drizzle-orm";
import { Message } from "../ipc_types";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { generateCommandWithFallbacks } from "../utils/package_manager_utils";

export const execPromise = promisify(exec);

export async function executeAddDependency({
  packages,
  message,
  appPath,
}: {
  packages: string[];
  message: Message;
  appPath: string;
}) {
  const packageStr = packages.join(" ");

  let command: string;
  try {
    // Use smart package manager detection
    command = await generateCommandWithFallbacks(appPath, "addDependency", { packages });
  } catch {
    // Fallback to the old command if detection fails
    command = `(pnpm add ${packageStr}) || (npm install --legacy-peer-deps ${packageStr})`;
  }

  const { stdout, stderr } = await execPromise(command, {
    cwd: appPath,
  });
  const installResults = stdout + (stderr ? `\n${stderr}` : "");

  // Update the message content with the installation results
  const updatedContent = message.content.replace(
    new RegExp(
      `<dyad-add-dependency packages="${packages.join(
        " ",
      )}">[^<]*</dyad-add-dependency>`,
      "g",
    ),
    `<dyad-add-dependency packages="${packages.join(
      " ",
    )}">${installResults}</dyad-add-dependency>`,
  );

  // Save the updated message back to the database
  await db
    .update(messages)
    .set({ content: updatedContent })
    .where(eq(messages.id, message.id));
}
