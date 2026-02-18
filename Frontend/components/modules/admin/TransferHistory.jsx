"use client";
import { useState, useMemo, useEffect } from "react";
import { ArrowRightLeft, Calendar as CalendarIcon, Clock, Filter, MapPin, User, X, Loader2 } from "lucide-react";
// import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getTransferHisotry } from "@/lib/services/inventory";
import CommonDatePicker from "@/components/ui/CommonDatePicker";

const TransferHistory = () => {
  const [clinicFilter, setClinicFilter] = useState("all");
  const [fromDate, setFromDate] = useState(undefined);
  const [toDate, setToDate] = useState(undefined);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getTransferHisotry();
        if (data) {
          setLogs(data);
        }
      } catch (error) {
        console.error("Error loading transfer history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (clinicFilter !== "all" && log.to_clinic_name !== clinicFilter) return false;
      const date = new Date(log.transferred_at);
      if (fromDate && isBefore(date, startOfDay(fromDate))) return false;
      if (toDate && isAfter(date, endOfDay(toDate))) return false;
      return true;
    });
  }, [clinicFilter, fromDate, toDate, logs]);

  const uniqueDestClinics = useMemo(
    () => [...new Set(logs.map((l) => l.to_clinic_name))],
    [logs]
  );

  const clearFilters = () => {
    setClinicFilter("all");
    setFromDate(undefined);
    setToDate(undefined);
  };

  const hasFilters = clinicFilter !== "all" || fromDate || toDate;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <ArrowRightLeft className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-card-foreground">Transfer History</h2>
          <p className="text-sm text-muted-foreground">
            {filteredLogs.length} of {logs.length} transfers
          </p>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
            <X className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Filters */}
      {/* <div className="mb-5 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/40 p-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Destination Clinic
          </label>
          <Select value={clinicFilter} onValueChange={setClinicFilter}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All clinics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clinics</SelectItem>
              {uniqueDestClinics.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            From Date
          </label>
          <div className="w-[140px]">
            <CommonDatePicker selectedDate={fromDate} onChange={setFromDate} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            To Date
          </label>
          <div className="w-[140px]">
            <CommonDatePicker selectedDate={toDate} onChange={setToDate} />
          </div>
        </div>
      </div> */}

      {/* Logs */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading history...
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No transfers match your filters.</p>
        ) : (
          filteredLogs.map((log, index) => {
            const date = new Date(log.transferred_at);
            const match = log.log_message.match(/transferred (\d+) x (.+?) \((.+?)\) from/);

            return (
              <div key={index} className="group rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/60">
                <div className="flex-1 space-y-2">
                  {match && (
                    <p className="font-medium text-card-foreground">
                      <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
                        {match[1]}x
                      </span>{" "}
                      {match[2]}{" "}
                      <span className="text-muted-foreground">({match[3]})</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{log.from_clinic_name}</span>
                    <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{log.to_clinic_name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><User className="h-3 w-3" />{log.transferred_by_name}</span>
                    {/* <span className="inline-flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{format(date, "MMM dd, yyyy")}</span> */}
                    {/* <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{format(date, "hh:mm a")}</span> */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    
  );
};

export default TransferHistory;
