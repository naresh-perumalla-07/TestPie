"use client";

import Modal from "@/components/ui/modal";
import { useDeleteRequest } from "@/modules/request/hooks/request";
import React from "react";
import { toast } from "sonner";

const DeleteRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  requestId,
  requestName,
  collectionId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestId: string;
  requestName: string;
  collectionId: string;
}) => {
  const { mutateAsync, isPending } = useDeleteRequest(collectionId);

  const handleDelete = async () => {
    try {
      await mutateAsync(requestId);
      toast.success("Request deleted successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete request");
      console.error("Failed to delete request:", err);
    }
  };

  return (
    <Modal
      title="Delete Request"
      description={`Are you sure you want to delete "${requestName}"? This action cannot be undone.`}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        Once deleted, this request will be permanently removed from the collection.
      </p>
    </Modal>
  );
};

export default DeleteRequestModal;

