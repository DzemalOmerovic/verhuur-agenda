import React, { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ReservationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  reservation: {
    id: number;
    car_name: string;
    start_date: string;
    end_date: string;
    customer_name: string;
  } | null;
}

export function ReservationDetailsDialog({ isOpen, onClose, onDelete, reservation }: ReservationDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!reservation) return null;

  const handleDelete = async () => {
    if (reservation) {
      await onDelete(reservation.id);
      setIsDeleteDialogOpen(false);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="car" className="text-right">
                Car
              </Label>
              <div id="car" className="col-span-3">
                {reservation.car_name}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <div id="customer" className="col-span-3">
                {reservation.customer_name}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <div id="start-date" className="col-span-3">
                {format(new Date(reservation.start_date), 'PPP')}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                End Date
              </Label>
              <div id="end-date" className="col-span-3">
                {format(new Date(reservation.end_date), 'PPP')}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete Reservation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reservation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}