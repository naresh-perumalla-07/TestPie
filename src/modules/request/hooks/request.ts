import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addRequestToCollection,
  getAllRequestFromCollection,
  Request,
  run,
  saveRequest,
  deleteRequest,
} from "../actions";
import { useRequestPlaygroundStore } from "../store/useRequestStore";

export function useAddRequestToCollection(collectionId: string) {
  const queryClient = useQueryClient();
  const { updateTabFromSavedRequest, activeTabId } = useRequestPlaygroundStore();
  return useMutation({
    mutationFn: async (value: Request) => addRequestToCollection(collectionId, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
      // @ts-ignore
      updateTabFromSavedRequest(activeTabId!, data);
    },
  });
}

export function useGetAllRequestFromCollection(collectionId: string) {

  return useQuery({
    queryKey: ["requests", collectionId],
    queryFn: async () => getAllRequestFromCollection(collectionId),
  });
}

export function useSaveRequest(id: string) {
 const { updateTabFromSavedRequest, activeTabId } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: Request) => saveRequest(id, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      // @ts-ignore
       updateTabFromSavedRequest(activeTabId!, data);
    },
  });
}


export function useRunRequest(requestId: string) {

  const {setResponseViewerData} = useRequestPlaygroundStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await run(requestId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      setResponseViewerData(data as any);
    },
  });
}

const allowedHeaders = [
  'date',
  'content-type',
  'server',
  'cache-control',
  'etag',
  'x-powered-by'
];

export function useSendDirectRequest() {
  const {setResponseViewerData} = useRequestPlaygroundStore();
  
  return useMutation({
    mutationFn: async (requestData: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      parameters?: Record<string, any>;
      body?: any;
    }) => {
      console.log('Direct Request Data:', requestData);
      const { sendRequest } = await import("../actions");
      const result = await sendRequest(requestData);
      console.log('Direct Request Result:', result);
      console.log('Response data type:', typeof result.data);
      console.log('Response data value:', result.data);
      
      // Create a mock requestRun to match ResponseData interface
      const mockRequestRun = {
        id: 'direct-request',
        requestId: 'direct-request',
        status: result.status || 0,
        statusText: result.statusText || 'OK',
        // headers: result.headers || {},
        headers: Object.fromEntries(
  Object.entries(result.headers || {}).filter(([key]) =>
    allowedHeaders.includes(key.toLowerCase())
  )
),
        body: typeof result.data === 'string' ? result.data : JSON.stringify(result.data), // Properly stringify the data
        durationMs: result.duration || 0,
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        requestRun: mockRequestRun,
        result: result
      };
    },
    onSuccess: (data) => {
      setResponseViewerData(data as any);
    },
  });
}

export function useDeleteRequest(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => deleteRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
    },
  });
}