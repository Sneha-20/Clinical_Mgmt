"use client";
import { useState } from "react";
import useFollowup from "@/lib/hooks/useFollowup";
import FollowupTable from "./FollowupTable";
import Pagination from "@/components/ui/Pagination";
import ContactConfirmationModal from "./ContactConfirmationModal";

export default function PendingFollowupList() {
  const {
    patients,
    pagination,
    handleViewProfile,
    handleNextPage,
    handlePrevPage,
    handleMarkAsContacted,
  } = useFollowup(false); // false for pending followups

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [selectedPatientName, setSelectedPatientName] = useState("");

  const handleMarkContactedClick = (visitId, patientName) => {
    setSelectedVisit(visitId);
    setSelectedPatientName(patientName);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (selectedVisit) {
      await handleMarkAsContacted(selectedVisit);
      setModalOpen(false);
      setSelectedVisit(null);
      setSelectedPatientName("");
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVisit(null);
    setSelectedPatientName("");
  };

  return (
    <div>
      <FollowupTable
        patients={patients}
        onViewProfile={handleViewProfile}
        onMarkAsContacted={handleMarkContactedClick}
        showMarkContacted={true}
      />
      {patients.length > 0 && (
        <Pagination
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
        />
      )}
      <ContactConfirmationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        patientName={selectedPatientName}
      />
    </div>
  );
}
