"use client";

import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { Phone, Mail, User, Calendar, CheckCircle, Clock } from "lucide-react";
import useAppointmentRequests from "@/lib/hooks/useAppointmentRequests";
import CommonBadge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AppointmentRequestList = () => {
  const {
    requestsList,
    totalPage,
    currentPage,
    handleMarkContacted,
    nextPage,
    prevPage,
  } = useAppointmentRequests();

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Appointment Requests
          </h1>
          <p className="text-muted-foreground">
            Manage patient appointment requests from the website
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold w-[25%] px-6 py-3 text-left">Patient Details</TableHead>
                <TableHead className="font-bold w-[20%] px-6 py-3 text-left">Contact Info</TableHead>
                <TableHead className="font-bold w-[15%] px-6 py-3 text-center">Clinic</TableHead>
                <TableHead className="font-bold w-[20%] px-6 py-3 text-left">Purpose</TableHead>
                <TableHead className="font-bold w-[10%] px-6 py-3 text-center">Date</TableHead>
                <TableHead className="font-bold w-[10%] px-6 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center align-middle">
                    <div className="flex flex-col items-center justify-center h-full">
                      <Mail className="h-8 w-8 text-muted-foreground opacity-30 mb-3" />
                      <div>
                        <h3 className="text-base font-semibold text-foreground leading-none mb-1 text-center">No Requests Found</h3>
                        <p className="text-xs text-muted-foreground text-center">Form submissions will appear here.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requestsList.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-foreground truncate">
                            {request.patient_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            ID: #{request.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle">
                      <div className="space-y-1.5 font-medium">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3.5 w-3.5 text-primary/60" />
                          <span className="text-foreground">{request.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-primary/60" />
                          <span className="text-foreground truncate max-w-[140px]" title={request.email}>
                            {request.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle text-center">
                      <div className="inline-flex">
                        <CommonBadge title={request.clinic_name} status="Pending" />
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle">
                      <p className="text-sm text-foreground line-clamp-2 leading-snug" title={request.purpose}>
                        {request.purpose}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle text-center">
                      <div className="inline-flex items-center gap-1.5 text-sm text-foreground font-medium">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 align-middle text-right">
                      {!request.contacted ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkContacted(request.id)}
                          className="hover:bg-primary hover:text-white border-primary text-primary shadow-sm whitespace-nowrap"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Contacted
                        </Button>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-100 italic">
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Contacted
                          </div>
                          {request.contacted_by_name && (
                            <p className="text-[10px] text-muted-foreground font-medium pr-1">
                              by {request.contacted_by_name}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {totalPage > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination
                page={currentPage}
                totalPages={totalPage}
                onNext={nextPage}
                onPrev={prevPage}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AppointmentRequestList;
