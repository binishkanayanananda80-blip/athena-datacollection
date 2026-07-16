"use client";

import { useState } from "react";
import { approveRegistration, rejectRegistration } from "@/lib/furniture-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminFurnitureActions({ registrationId }: { registrationId: string }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const res = await approveRegistration(registrationId);
      if (res.success) {
        toast.success("Registration approved successfully.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to approve registration.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      const res = await rejectRegistration(registrationId);
      if (res.success) {
        toast.success("Registration rejected.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reject registration.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
      >
        {isApproving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
        Approve
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
        onClick={handleReject}
        disabled={isApproving || isRejecting}
      >
        {isRejecting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
        Reject
      </Button>
    </div>
  );
}
