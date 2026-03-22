"use client";
import { useState } from "react";
import { Calendar, Package, User, Hash, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useTrialDevice from "@/lib/hooks/useTrialDevice";
import CompleteTrialModal from "./components/CompleteTrialModal";
import Pagination from "@/components/ui/Pagination";
import SearchBox from "@/components/modules/receptionist/component/SearchBox";
import DropDown from "@/components/ui/dropdown";

const trialDecisionOptions = [
  { label: "All", value: "All" },
  { label: "Trial Active", value: "TRIAL_ACTIVE" },
  { label: "Follow up", value: "Follow up" },
  { label: "Book - Awaiting Stock", value: "BOOK - Awaiting Stock" },
  { label: "Book - Device Allocated", value: "BOOK - Device Allocated" },
  { label: "Book - with Customization", value: "BOOK - With Customization" },
  { label: "Decline", value: "DECLINE" },
];

const TrialList = () => {
  const {
    activeTrialDeviceList,
    inventoryDevice,
    serials,
    totalPage,
    currentPage,
    form,
    selectedTrial,
    completeTrialDialogOpen,
    notBookReason,
    extendForm,
    selectedAction,

    setSelectedAction,
    handleExtendChange,
    setExtendForm,
    setNotBookReason,
    handleCloseDialog,
    openDecisionDialog,
    handleCompleteTrials,
    handleChange,
    nextPage,
    prevPage,
    searchTerm,
    setSearchTerm,
    filterDecision,
    setFilterDecision,
  } = useTrialDevice();

  const getStatusBadge = (status) => {
    const baseClass =
      "inline-block px-3 py-1 text-xs font-medium rounded-full border";
    switch (status) {
      case "Trial Active":
        return (
          <p
            className={`${baseClass} bg-yellow-100 text-yellow-700 border-yellow-300`}
          >
            In Trial
          </p>
        );

      case "BOOK - Awaiting Stock":
        return (
          <p
            className={`${baseClass} bg-blue-100 text-blue-600 border-blue-300`}
          >
            Awaiting Stock
          </p>
        );

      case "Follow up":
        return (
          <p
            className={`${baseClass} bg-orange-100 text-orange-700 border-orange-300`}
          >
            Follow up
          </p>
        );

      case "BOOK - Device Allocated":
        return (
          <p
            className={`${baseClass} bg-green-100 text-green-700 border-green-300`}
          >
            Booked
          </p>
        );

      case "DECLINE":
        return (
          <p className={`${baseClass} bg-red-200 text-red-700 border-red-300`}>
            Not Booked
          </p>
        );

      default:
        return (
          <p
            className={`${baseClass} bg-slate-100 text-slate-700 border-slate-300`}
          >
            {status}
          </p>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Trial Devices
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage devices currently on trial with patients
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid sm:grid-cols-4 grid-cols-1 gap-4 mb-6 bg-card p-4 rounded-lg shadow-sm border border-border/50 items-end">
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Search</label>
            <div className="w-full">
              <SearchBox
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Filter by Decision</label>
            <div className="w-full">
              <DropDown
                options={trialDecisionOptions}
                value={filterDecision}
                name="filterDecision"
                placeholder="Select Decision Filter"
                onChange={(name, value) => setFilterDecision(value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid gap-4">
            {activeTrialDeviceList.map((trial) => (
              <Card
                key={trial.id}
                className="border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <User className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Patient</p>
                        <p className="font-medium text-foreground">
                          {trial.assigned_patient}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Phone: {trial.assigned_patient_phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <Package className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Device</p>
                        <p className="font-medium text-foreground">
                          {trial.device_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Hash className="h-3 w-3 inline mr-1" />
                          {trial.serial_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <Calendar className="h-5 w-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Trial Period
                        </p>
                        <p className="font-medium text-foreground">
                          {new Date(
                            trial.trial_start_date,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(trial.trial_end_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center">
                          {getStatusBadge(trial.trial_decision)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 ml-4">
                      <Button
                        size="sm"
                        disabled={
                          trial.trial_decision !== "Follow up" &&
                          trial.trial_decision !== "TRIAL_ACTIVE"
                        }
                        onClick={() => openDecisionDialog(trial)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete Trial
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {activeTrialDeviceList.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No active trials at the moment
                  </p>
                </CardContent>
              </Card>
            )}

            <Pagination
              page={currentPage}
              totalPages={totalPage}
              onNext={nextPage}
              onPrev={prevPage}
            />
          </div>
        </div>

        <CompleteTrialModal
          completeTrialDialogOpen={completeTrialDialogOpen}
          selectedTrial={selectedTrial}
          handleCloseDialog={handleCloseDialog}
          inventoryDevice={inventoryDevice}
          serialOption={serials}
          form={form}
          handleChange={handleChange}
          handleCompleteTrials={handleCompleteTrials}
          setNotBookReason={setNotBookReason}
          notBookReason={notBookReason}
          extendForm={extendForm}
          setExtendForm={setExtendForm}
          handleExtendChange={handleExtendChange}
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
        />
      </main>
    </div>
  );
};

export default TrialList;
