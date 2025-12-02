"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

export default function Modal({ onClose, header, onSubmit, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-lg">{header}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>{children}</CardContent>
        {/* <div className="p-6 pt-0">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div> */}
      </Card>
    </div>
  );
}
