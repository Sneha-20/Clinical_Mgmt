"use client";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function ContactConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  patientName,
}) {
  return (
    <Modal
      isModalOpen={isOpen}
      onClose={onClose}
      header="Confirm Contact"
      Icon={CheckCircle}
      showButton={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Have you contacted <strong>{patientName}</strong>?
        </p>
        <p className="text-xs text-slate-500">
          Clicking "Yes" will mark this patient as contacted.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            No
          </Button>
          <Button onClick={onConfirm}>
            Yes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
