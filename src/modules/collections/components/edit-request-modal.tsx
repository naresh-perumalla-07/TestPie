"use client";

import Modal from "@/components/ui/modal";
import { useSaveRequest } from "@/modules/request/hooks/request";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const EditRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  requestId,
  initialData,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestId: string;
  initialData: {
    name: string;
    method: string;
    url: string;
    body?: string;
    headers?: string;
    parameters?: string;
  };
}) => {
  const [name, setName] = useState(initialData.name);
  const [method, setMethod] = useState(initialData.method);
  const [url, setUrl] = useState(initialData.url);
  const [body, setBody] = useState(initialData.body || "");
  const [headers, setHeaders] = useState(initialData.headers || "");
  const [parameters, setParameters] = useState(initialData.parameters || "");

  const { mutateAsync, isPending } = useSaveRequest(requestId);

  useEffect(() => {
    if (isModalOpen) {
      setName(initialData.name);
      setMethod(initialData.method);
      setUrl(initialData.url);
      setBody(initialData.body || "");
      setHeaders(initialData.headers || "");
      setParameters(initialData.parameters || "");
    }
  }, [isModalOpen, initialData]);

  const handleSubmit = async () => {
    if (!name.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }

    try {
      await mutateAsync({
        name,
        method,
        url,
        body: body || undefined,
        headers: headers || undefined,
        parameters: parameters || undefined,
      });
      toast.success("Request updated successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to update request");
      console.error("Failed to update request:", err);
    }
  };

  return (
    <Modal
      title="Edit Request"
      description="Update your request details"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
      submitText={isPending ? "Saving..." : "Save Changes"}
      submitVariant="default"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full p-2 border rounded bg-zinc-800 border-zinc-700 text-white"
            placeholder="Request name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Method</label>
            <select
              className="w-full p-2 border rounded bg-zinc-800 border-zinc-700 text-white"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div className="flex-2">
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              className="w-full p-2 border rounded bg-zinc-800 border-zinc-700 text-white"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Body (JSON)</label>
          <textarea
            className="w-full p-2 border rounded bg-zinc-800 border-zinc-700 text-white h-24"
            placeholder='{"key": "value"}'
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Headers (JSON)</label>
          <textarea
            className="w-full p-2 border rounded bg-zinc-800 border-zinc-700 text-white h-20"
            placeholder='{"Content-Type": "application/json"}'
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Parameters (JSON)</label>
          <textarea
            className="w-full p-2 border rounded bg-zinc-800 border-zinc-700 text-white h-20"
            placeholder='{"param1": "value1"}'
            value={parameters}
            onChange={(e) => setParameters(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default EditRequestModal;

