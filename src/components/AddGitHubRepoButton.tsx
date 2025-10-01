import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { showError } from "@/lib/toast";

export function AddGitHubRepoButton() {
  const navigate = useNavigate();
  const selectedAppId = useAtomValue(selectedAppIdAtom);

  const handleClick = () => {
    if (!selectedAppId) {
      showError(
        "Please select or create an app first before adding a GitHub repository.",
      );
      return;
    }
    navigate({ to: "/add-github-repo" });
  };

  return (
    <div className="px-4 pb-1 flex justify-center">
      <Button variant="outline" size="default" onClick={handleClick}>
        <Github className="mr-2 h-4 w-4" />
        Add GitHub Repo
      </Button>
    </div>
  );
}
