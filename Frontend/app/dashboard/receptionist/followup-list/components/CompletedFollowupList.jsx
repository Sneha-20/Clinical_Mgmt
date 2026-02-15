"use client";
import useFollowup from "@/lib/hooks/useFollowup";
import FollowupTable from "./FollowupTable";
import Pagination from "@/components/ui/Pagination";

export default function CompletedFollowupList() {
  const {
    patients,
    pagination,
    handleViewProfile,
    handleNextPage,
    handlePrevPage,
  } = useFollowup(true); // true for completed followups

  return (
    <div>
      <FollowupTable
        patients={patients}
        onViewProfile={handleViewProfile}
        showMarkContacted={false}
      />
      {patients.length > 0 && (
        <Pagination
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
        />
      )}
    </div>
  );
}
