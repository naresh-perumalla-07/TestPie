import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Editor from "@monaco-editor/react";
import {
  Clock,
  HardDrive,
  CheckCircle,
  Copy,
  Download,
  Filter,
  MoreHorizontal,
  Code,
  FileText,
  Settings,
  TestTube,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type HeadersMap = Record<string, string>;

interface RequestRun {
  id: string;
  requestId?: string;
  status?: number;
  statusText?: string;
  headers?: HeadersMap;
  body?: string | object | null;
  durationMs?: number;
  createdAt?: string;
}

interface Result {
  status?: number;
  statusText?: string;
  duration?: number;
  size?: number;
}

export interface ResponseData {
  success: boolean;
  requestRun: RequestRun;
  result?: Result;
}

interface Props {
  responseData: ResponseData;
}

const ResponseViewer = ({ responseData }: Props) => {
  const [activeTab, setActiveTab] = useState("json");
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [showFilter, setShowFilter] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    showSuccess: true,
    showError: true,
    showRedirect: true,
    showClientError: true,
    showServerError: true,
  });

  const getStatusColor = (status?: number): string => {
    const s = typeof status === "number" ? status : 0;
    if (s >= 200 && s < 300) return "text-green-400";
    if (s >= 300 && s < 400) return "text-yellow-400";
    if (s >= 400 && s < 500) return "text-orange-400";
    if (s >= 500) return "text-red-400";
    return "text-gray-400";
  };

  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyToClipboard = async (text: string, key: string) => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSave = () => {
    // Save response data to a file
    const dataToSave = {
      status: responseData.result?.status ?? responseData.requestRun?.status,
      statusText: responseData.result?.statusText ?? responseData.requestRun?.statusText,
      headers: (responseData.result as any)?.headers ?? responseData.requestRun?.headers,
      body: (responseData.result as any)?.data ?? responseData.requestRun?.body,
      duration: responseData.result?.duration ?? responseData.requestRun?.durationMs,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Response saved to file');
  };

  // Defensive parse: body may be already an object or invalid JSON
  let responseBody: unknown = {};
  let formattedJsonString = "";
  try {
    const rawBody = responseData?.requestRun?.body;
    if (typeof rawBody === "string") {
      responseBody = rawBody.length ? JSON.parse(rawBody) : rawBody;
    } else {
      responseBody = rawBody ?? {};
    }
    formattedJsonString = JSON.stringify(responseBody, null, 2);
  } catch (e) {
    // If parsing fails, fall back to the raw string
    responseBody = responseData?.requestRun?.body ?? {};
    formattedJsonString =
      typeof responseBody === "string"
        ? responseBody
        : JSON.stringify(responseBody, null, 2);
  }

  const status: number | undefined =
    responseData.result?.status ?? responseData.requestRun?.status;
  const statusText: string | undefined =
    responseData.result?.statusText ?? responseData.requestRun?.statusText;
  const duration: number | undefined =
    responseData.result?.duration ?? responseData.requestRun?.durationMs;
  const size: number | undefined = responseData.result?.size;
  const rawBody = responseData.requestRun?.body;

  return (
    <div className="w-full bg-zinc-950 text-white p-6">
      <div className="w-full mx-auto">
        {/* Status Header */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Status:</span>
                  <Badge
                    className={`${getStatusColor(
                      status
                    )} bg-transparent border-current`}
                  >
                    {status ?? "—"} • {statusText ?? ""}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Time:</span>
                  <span className="text-blue-300">
                    {duration ? `${duration} ms` : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Size:</span>
                  <span className="text-green-300">{formatBytes(size)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu open={showFilter} onOpenChange={setShowFilter}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`text-gray-400 hover:text-white ${showFilter ? 'bg-zinc-700' : ''}`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem
                      onClick={() => setFilterOptions(prev => ({ ...prev, showSuccess: !prev.showSuccess }))}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      <span>Success (2xx)</span>
                      {filterOptions.showSuccess && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterOptions(prev => ({ ...prev, showRedirect: !prev.showRedirect }))}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                      <span>Redirect (3xx)</span>
                      {filterOptions.showRedirect && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterOptions(prev => ({ ...prev, showClientError: !prev.showClientError }))}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <Settings className="w-4 h-4 mr-2 text-orange-400" />
                      <span>Client Error (4xx)</span>
                      {filterOptions.showClientError && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterOptions(prev => ({ ...prev, showServerError: !prev.showServerError }))}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <TestTube className="w-4 h-4 mr-2 text-red-400" />
                      <span>Server Error (5xx)</span>
                      {filterOptions.showServerError && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  onClick={handleSave}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save
                </Button>

                {/* <DropdownMenu open={showMoreOptions} onOpenChange={setShowMoreOptions}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`text-gray-400 hover:text-white ${showMoreOptions ? 'bg-zinc-700' : ''}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Export as cURL');
                        setShowMoreOptions(false);
                      }}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      <span>Export as cURL</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Export as JavaScript');
                        setShowMoreOptions(false);
                      }}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      <span>Export as JavaScript</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-700" />
                    <DropdownMenuItem
                      onClick={() => {
                        console.log('Clear response');
                        setShowMoreOptions(false);
                      }}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Clear Response</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent> */}
                {/* </DropdownMenu> */}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Response Tabs */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-200">Response Body</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="px-6 border-b border-zinc-800">
                <TabsList className="bg-transparent p-0 h-auto">
                  <TabsTrigger
                    value="json"
                    className="bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger
                    value="raw"
                    className="bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Raw
                  </TabsTrigger>
                  <TabsTrigger
                    value="headers"
                    className="bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Headers
                    <Badge
                      variant="secondary"
                      className="ml-2 text-xs bg-zinc-700"
                    >
                      {
                        Object.keys(responseData.requestRun.headers ?? {})
                          .length
                      }
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="test"
                    className="bg-transparent data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-gray-400 rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-blue-500 px-4 py-2"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Results
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="json" className="mt-0">
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white bg-zinc-800/50 backdrop-blur-sm"
                      onClick={() => copyToClipboard(formattedJsonString, 'json')}
                    >
                      {copiedStates.json ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="h-96">
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={formattedJsonString}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        wordWrap: "on",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: "none",
                        scrollbar: {
                          vertical: "auto",
                          horizontal: "auto",
                          verticalScrollbarSize: 8,
                          horizontalScrollbarSize: 8,
                        },
                      }}
                      theme="vs-dark"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="raw" className="mt-0">
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(String(rawBody ?? ""), 'raw')}
                    >
                      {copiedStates.raw ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="h-96">
                    <Editor
                      height="100%"
                      defaultLanguage="text"
                      value={String(rawBody ?? "")}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        wordWrap: "on",
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: "none",
                        scrollbar: {
                          vertical: "auto",
                          horizontal: "auto",
                          verticalScrollbarSize: 8,
                          horizontalScrollbarSize: 8,
                        },
                      }}
                      theme="vs-dark"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="headers" className="mt-0">
                <ScrollArea className="h-96">
                  <div className="p-6">
                    <div className="space-y-3">
                      {Object.entries(
                        responseData.requestRun.headers ?? {}
                      ).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between py-2 border-b border-zinc-800 last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-blue-300 text-sm">
                              {key}
                            </div>
                            <div className="text-gray-300 text-sm break-all">
                              {value}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white ml-2"
                            onClick={() => copyToClipboard(`${key}: ${value}`, `header-${key}`)}
                          >
                            {copiedStates[`header-${key}`] ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="test" className="mt-0">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">
                      All tests passed
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <span className="text-gray-300">Status code is 200</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <span className="text-gray-300">
                        Response time is less than 3000ms
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                      <span className="text-gray-300">
                        Content-Type is present
                      </span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResponseViewer;
