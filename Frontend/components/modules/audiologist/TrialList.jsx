"use client";
import { useState } from "react";
import { Calendar, Package, User, Hash, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useTrialDevice from "@/lib/hooks/useTrialDevice";
import CompleteTrialModal from "./components/CompleteTrialModal";
import Pagination from "@/components/ui/Pagination";

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

      case "Follow-up":
        return (
          <p className={`${baseClass} bg-red-100 text-red-700 border-red-300`}>
            Trial Ended
          </p>
        );

      case "Device Booked":
        return (
          <p
            className={`${baseClass} bg-green-100 text-green-700 border-green-300`}
          >
            Booked
          </p>
        );

      case "not-booked":
        return (
          <p
            className={`${baseClass} bg-gray-100 text-gray-700 border-gray-300`}
          >
            Returned
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
        <div className="mb-8">
          <div className="grid gap-4">
            {activeTrialDeviceList.map((trial) => (
              <Card
                key={trial.id}
                className="border-border/50 hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Device
                          </p>
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
                          <User className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Patient
                          </p>
                          <p className="font-medium text-foreground">
                            {trial.assigned_patient}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Phone: {trial.assigned_patient_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <Calendar className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Trial Period
                          </p>
                          <p className="font-medium text-foreground">
                            {new Date(
                              trial.trial_start_date
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              trial.trial_end_date
                            ).toLocaleDateString()}
                          </p>
                          <div className="flex items-center">
                            {getStatusBadge(trial.trial_decision)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
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
