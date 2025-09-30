import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { showError } from "@/lib/toast";

export function PackageManagerSelector() {
  const { settings, updateSettings } = useSettings();

  if (!settings) {
    return null;
  }

  const handlePackageManagerChange = async (
    value: "npm" | "yarn" | "pnpm" | "bun"
  ) => {
    try {
      await updateSettings({ preferredPackageManager: value });
    } catch (error: any) {
      showError(`Failed to update package manager: ${error.message}`);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Label
            className="text-sm font-medium"
            htmlFor="package-manager-select"
          >
            Package Manager
          </Label>
          <Select
            value={settings.preferredPackageManager ?? "npm"}
            onValueChange={handlePackageManagerChange}
          >
            <SelectTrigger className="w-48" id="package-manager-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="npm">npm</SelectItem>
              <SelectItem value="yarn">yarn</SelectItem>
              <SelectItem value="pnpm">pnpm</SelectItem>
              <SelectItem value="bun">bun</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Choose which package manager Dyad should use for installing
          dependencies and running scripts. If not set, Dyad will auto-detect
          based on your project's lock files.
        </div>
      </div>
    </div>
  );
}
