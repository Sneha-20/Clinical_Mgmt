"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

export default function Modal({ onClose,Icon, header, onSubmit,showButton=true, children,isModalOpen,ClassName}) {
  if (!isModalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card
        className={`w-full max-w-2xl max-h-[95vh] overflow-y-auto ${ClassName}`}
      >
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-primary" />}
            <CardTitle className="text-lg">{header}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent>{children}</CardContent>
        {showButton && (
          <div className="p-6 pt-0">
            {(onClose && showButton) && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}

            {onSubmit && (
              <Button onClick={onSubmit} className="ml-2">
                Submit
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
