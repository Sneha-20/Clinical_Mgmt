"use client";
import { ArrowRightLeft, Calendar as MapPin, User, Loader2 } from "lucide-react";

const TransferHistory = ({ transferHook }) => {
const{ loading, logs, } = transferHook;
 
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
          <ArrowRightLeft className="h-5 w-5 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-card-foreground">Transfer History</h2>
        </div>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading history...
          </div>
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No transfers match your filters.</p>
        ) : (
          logs.map((log, index) => {
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
