import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Github, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Code,
  Settings
} from "lucide-react";
import { IpcClient } from "@/ipc/ipc_client";
import { useMutation } from "@tanstack/react-query";
import { showError, showSuccess } from "@/lib/toast";
import { useAtomValue } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { useLoadApp } from "@/hooks/useLoadApp";

interface RepoAnalysisResult {
  repository: {
    name: string;
    full_name: string;
    description: string;
    language: string;
    topics: string[];
    stars: number;
    forks: number;
  };
  analysis: {
    mainTechnology: string;
    framework: string;
    dependencies: string[];
    complexity: 'simple' | 'moderate' | 'complex';
    integrationApproaches: {
      recreate: {
        feasible: boolean;
        effort: 'low' | 'medium' | 'high';
        description: string;
      };
      integrate: {
        feasible: boolean;
        effort: 'low' | 'medium' | 'high';
        description: string;
      };
      tailor: {
        feasible: boolean;
        effort: 'low' | 'medium' | 'high';
        description: string;
      };
    };
    recommendation: 'recreate' | 'integrate' | 'tailor';
    reasoning: string;
  };
}

type IntegrationStep = 'input' | 'analyzing' | 'results' | 'processing' | 'complete';

export default function AddGitHubRepoPage() {
  const navigate = useNavigate();
  const [githubUrl, setGithubUrl] = useState("");
  const [githubUrlError, setGithubUrlError] = useState("");
  const [currentStep, setCurrentStep] = useState<IntegrationStep>('input');
  const [analysisResult, setAnalysisResult] = useState<RepoAnalysisResult | null>(null);
  const [selectedApproach, setSelectedApproach] = useState<'recreate' | 'integrate' | 'tailor' | null>(null);
  
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const { app } = useLoadApp(selectedAppId);

  const validateGithubUrl = (url: string): boolean => {
    if (!url.trim()) {
      setGithubUrlError("");
      return false;
    }

    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== "github.com") {
        setGithubUrlError("URL must be from github.com");
        return false;
      }
      const pathParts = urlObj.pathname
        .split("/")
        .filter((part) => part.length > 0);
      if (pathParts.length < 2) {
        setGithubUrlError("Invalid GitHub repository URL format");
        return false;
      }
      setGithubUrlError("");
      return true;
    } catch {
      setGithubUrlError("Invalid URL format");
      return false;
    }
  };

  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setGithubUrl(url);
    validateGithubUrl(url);
  };

  const analyzeRepoMutation = useMutation({
    mutationFn: async (repoUrl: string) => {
      if (!selectedAppId) {
        throw new Error("No app selected. Please go back and select an app first.");
      }
      
      setCurrentStep('analyzing');
      
      // This will be implemented as a new IPC handler
      const result = await IpcClient.getInstance().analyzeGithubRepo({
        repoUrl,
        targetAppId: selectedAppId,
      });
      
      return result;
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      setCurrentStep('results');
    },
    onError: (error: Error) => {
      showError(error.message);
      setCurrentStep('input');
    },
  });

  const integrateRepoMutation = useMutation({
    mutationFn: async () => {
      if (!analysisResult || !selectedApproach || !selectedAppId) {
        throw new Error("Missing required data for integration");
      }

      setCurrentStep('processing');

      // This will be implemented as a new IPC handler
      const result = await IpcClient.getInstance().integrateGithubRepo({
        repoUrl: githubUrl,
        targetAppId: selectedAppId,
        approach: selectedApproach,
        analysisResult: analysisResult,
      });

      return result;
    },
    onSuccess: () => {
      setCurrentStep('complete');
      showSuccess("GitHub repository integrated successfully!");
    },
    onError: (error: Error) => {
      showError(error.message);
      setCurrentStep('results');
    },
  });

  const handleAnalyze = () => {
    if (!validateGithubUrl(githubUrl)) {
      return;
    }
    analyzeRepoMutation.mutate(githubUrl);
  };

  const handleIntegrate = () => {
    if (!selectedApproach) {
      showError("Please select an integration approach");
      return;
    }
    integrateRepoMutation.mutate();
  };

  const getStepIcon = (step: IntegrationStep) => {
    switch (step) {
      case 'input':
        return <Github className="h-5 w-5" />;
      case 'analyzing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'results':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getApproachIcon = (approach: 'recreate' | 'integrate' | 'tailor') => {
    switch (approach) {
      case 'recreate':
        return <Sparkles className="h-4 w-4" />;
      case 'integrate':
        return <Code className="h-4 w-4" />;
      case 'tailor':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getApproachTitle = (approach: 'recreate' | 'integrate' | 'tailor') => {
    switch (approach) {
      case 'recreate':
        return 'Recreate Functionality';
      case 'integrate':
        return 'Integrate As-Is';
      case 'tailor':
        return 'Tailor Integration';
    }
  };

  const getEffortColor = (effort: 'low' | 'medium' | 'high') => {
    switch (effort) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: "/" })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          {getStepIcon(currentStep)}
          <h1 className="text-3xl font-bold">Add GitHub Repository</h1>
        </div>
        
        <p className="text-muted-foreground">
          Integrate a GitHub repository into your app with intelligent analysis and customized approaches.
        </p>
      </div>

      {!selectedAppId && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No app selected. Please go back to the home page and select an app before adding a GitHub repository.
          </AlertDescription>
        </Alert>
      )}

      {selectedAppId && app && (
        <Alert className="mb-6 border-blue-500/20 text-blue-700">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Integrating repository into: <strong>{app.name}</strong>
          </AlertDescription>
        </Alert>
      )}

      {currentStep === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>Repository Information</CardTitle>
            <CardDescription>
              Enter the GitHub repository URL you want to integrate into your app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github-url">GitHub Repository URL</Label>
              <Input
                id="github-url"
                value={githubUrl}
                onChange={handleGithubUrlChange}
                placeholder="https://github.com/username/repository"
                disabled={analyzeRepoMutation.isPending}
              />
              {githubUrlError && (
                <p className="text-sm text-red-500">{githubUrlError}</p>
              )}
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This feature will analyze the repository and suggest the best way to integrate it into your existing app, 
                whether that's recreating the functionality, integrating it as-is, or tailoring it to your specific needs.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleAnalyze}
              disabled={!validateGithubUrl(githubUrl) || analyzeRepoMutation.isPending || !selectedAppId}
              className="w-full"
            >
              {analyzeRepoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Repository...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Analyze Repository
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'analyzing' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <h3 className="text-lg font-semibold">Analyzing Repository</h3>
              <p className="text-muted-foreground">
                Examining the repository structure, dependencies, and determining the best integration approach...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'results' && analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                {analysisResult.repository.name}
              </CardTitle>
              <CardDescription>
                {analysisResult.repository.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-muted-foreground">{analysisResult.repository.language}</p>
                </div>
                <div>
                  <p className="font-medium">Framework</p>
                  <p className="text-muted-foreground">{analysisResult.analysis.framework}</p>
                </div>
                <div>
                  <p className="font-medium">Stars</p>
                  <p className="text-muted-foreground">{analysisResult.repository.stars}</p>
                </div>
                <div>
                  <p className="font-medium">Complexity</p>
                  <p className="text-muted-foreground capitalize">{analysisResult.analysis.complexity}</p>
                </div>
              </div>
              
              {analysisResult.repository.topics.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.repository.topics.map((topic) => (
                      <span key={topic} className="px-2 py-1 bg-secondary rounded-md text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Approaches</CardTitle>
              <CardDescription>
                Choose how you'd like to integrate this repository into your app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analysisResult.analysis.integrationApproaches).map(([key, approach]) => {
                const approachKey = key as 'recreate' | 'integrate' | 'tailor';
                const isRecommended = analysisResult.analysis.recommendation === approachKey;
                
                return (
                  <div
                    key={key}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedApproach === approachKey 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : approach.feasible 
                          ? 'border-gray-200 hover:border-gray-300' 
                          : 'border-gray-100 opacity-50 cursor-not-allowed'
                    } ${isRecommended ? 'ring-2 ring-green-500/20' : ''}`}
                    onClick={() => approach.feasible && setSelectedApproach(approachKey)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getApproachIcon(approachKey)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{getApproachTitle(approachKey)}</h4>
                            {isRecommended && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {approach.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>
                              Effort: <span className={getEffortColor(approach.effort)}>
                                {approach.effort}
                              </span>
                            </span>
                            <span>
                              {approach.feasible ? (
                                <span className="text-green-600">✓ Feasible</span>
                              ) : (
                                <span className="text-red-600">✗ Not feasible</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {analysisResult.analysis.reasoning && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommendation:</strong> {analysisResult.analysis.reasoning}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCurrentStep('input')}>
              Back
            </Button>
            <Button 
              onClick={handleIntegrate}
              disabled={!selectedApproach || integrateRepoMutation.isPending}
            >
              {integrateRepoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Integrating...
                </>
              ) : (
                'Integrate Repository'
              )}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'processing' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <h3 className="text-lg font-semibold">Integrating Repository</h3>
              <p className="text-muted-foreground">
                Applying the selected integration approach. This may take a few minutes...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'complete' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <h3 className="text-lg font-semibold">Integration Complete!</h3>
              <p className="text-muted-foreground">
                The GitHub repository has been successfully integrated into your app.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => {
                  setCurrentStep('input');
                  setGithubUrl("");
                  setAnalysisResult(null);
                  setSelectedApproach(null);
                }}>
                  Add Another Repository
                </Button>
                <Button onClick={() => navigate({ to: "/" })}>
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}