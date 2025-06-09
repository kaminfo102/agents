"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { eventEmitter, EVENTS } from "@/lib/events";

interface DeleteRepresentativeDialogProps {
  representative: {
    id: string;
    firstName: string;
    lastName: string;
  };
  trigger?: React.ReactNode;
}

export function DeleteRepresentativeDialog({ representative, trigger }: DeleteRepresentativeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/representatives/${representative.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete representative");
      }

      toast({
        title: "نماینده حذف شد",
        description: "نماینده با موفقیت حذف شد",
      });

      setOpen(false);
      
      // Emit event and refresh the page
      eventEmitter.emit(EVENTS.REPRESENTATIVE_DELETED, representative.id);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف نماینده با مشکل مواجه شد",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حذف نماینده</DialogTitle>
          <DialogDescription>
            آیا از حذف نماینده {representative.firstName} {representative.lastName} اطمینان دارید؟
            این عملیات غیرقابل بازگشت است.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            انصراف
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال حذف...
              </div>
            ) : (
              "حذف نماینده"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 