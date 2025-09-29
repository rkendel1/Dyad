import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./root";
import AddGitHubRepoPage from "../pages/add-github-repo";

export const addGitHubRepoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-github-repo",
  component: AddGitHubRepoPage,
});