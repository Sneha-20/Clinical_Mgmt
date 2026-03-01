"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import useAwaitingDevices from "@/lib/hooks/useAwaitingDevices";
import { CommonLoader } from "@/components/ui/CommonLoader";
import { Phone, User, Calendar, Package } from "lucide-react";
import AwaitingDeviceModal from "./components/AwaitingDeviceModal";

const AwaitingDeviceList = () => {
  const {
    awaitingDevicesList,
    serials,
    totalPage,
    currentPage,
    completeTrialDialogOpen,
    selectedTrial,
    form,
    isCompleting,
    openCompleteDialog,
    handleCloseDialog,
    fetchSerialsByDevice,
    handleChange,
    handleCompleteTrial,
    nextPage,
    prevPage,
  } = useAwaitingDevices();

  const getStatusBadge = (status) => {
    const baseClass =
      "inline-block px-3 py-1 text-xs font-medium rounded-full border";
    switch (status) {
      case "BOOK - Awaiting Stock":
        return (
          <p className={`${baseClass} bg-blue-100 text-blue-600 border-blue-300`}>
            Awaiting Stock
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

  if (!awaitingDevicesList) {
    return <CommonLoader />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Awaiting Stock Trials
          </h1>
          <p className="text-muted-foreground">
            Manage trial devices awaiting stock allocation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg shadow p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Trials</p>
            <p className="text-2xl font-bold text-foreground">
              {awaitingDevicesList.length}
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
          {awaitingDevicesList.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No awaiting trials found
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Device Details</TableHead>
                    <TableHead>Trial End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {awaitingDevicesList.map((trial) => (
                    <TableRow key={trial.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {trial.patient_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {trial.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-foreground">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{trial.patient_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-foreground">{trial.doctor_name}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {trial.device_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trial.device_brand} • {trial.device_model}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-foreground">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(trial.trial_end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(trial.trial_decision)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => openCompleteDialog(trial)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Complete Trial
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPage > 1 && (
                <div className="p-4 border-t border-border">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPage}
                    onNext={nextPage}
                    onPrev={prevPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Complete Trial Modal */}
      <AwaitingDeviceModal
        completeTrialDialogOpen={completeTrialDialogOpen}
        selectedTrial={selectedTrial}
        handleCloseDialog={handleCloseDialog}
        serials={serials}
        form={form}
        handleChange={handleChange}
        handleCompleteTrial={handleCompleteTrial}
        fetchSerialsByDevice={fetchSerialsByDevice}
        isCompleting={isCompleting}
      />
    </div>
  );
};

export default AwaitingDeviceList;
