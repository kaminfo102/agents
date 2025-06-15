"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Search, Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { AddRepresentativeButton } from "./add-representative-button";
import { EditRepresentativeDialog } from "./edit-representative-dialog";
import { DeleteRepresentativeDialog } from "./delete-representative-dialog";
import { eventEmitter, EVENTS } from "@/lib/events";

interface Representative {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  city: string;
  educationCenter: string;
  isActive: boolean;
  profileImage: string | null;
}

export function RepresentativeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  const fetchRepresentatives = useCallback(async () => {
    try {
      const response = await fetch("/api/representatives");
      
      if (!response.ok) {
        throw new Error("Failed to fetch representatives");
      }
      
      const data = await response.json();
      setRepresentatives(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات نمایندگان با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchRepresentatives();

    // Listen for representative events
    const handleRepresentativeCreated = () => {
      fetchRepresentatives();
    };

    const handleRepresentativeUpdated = () => {
      fetchRepresentatives();
    };

    const handleRepresentativeDeleted = () => {
      fetchRepresentatives();
    };

    eventEmitter.on(EVENTS.REPRESENTATIVE_CREATED, handleRepresentativeCreated);
    eventEmitter.on(EVENTS.REPRESENTATIVE_UPDATED, handleRepresentativeUpdated);
    eventEmitter.on(EVENTS.REPRESENTATIVE_DELETED, handleRepresentativeDeleted);

    return () => {
      eventEmitter.off(EVENTS.REPRESENTATIVE_CREATED, handleRepresentativeCreated);
      eventEmitter.off(EVENTS.REPRESENTATIVE_UPDATED, handleRepresentativeUpdated);
      eventEmitter.off(EVENTS.REPRESENTATIVE_DELETED, handleRepresentativeDeleted);
    };
  }, [fetchRepresentatives]);
  
  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/representatives/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update representative status");
      }
      
      setRepresentatives(reps => 
        reps.map(rep => 
          rep.id === id ? { ...rep, isActive } : rep
        )
      );
      
      toast({
        title: "وضعیت نماینده بروزرسانی شد",
        description: `نماینده با موفقیت ${isActive ? 'فعال' : 'غیرفعال'} شد`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "تغییر وضعیت نماینده با مشکل مواجه شد",
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این نماینده اطمینان دارید؟")) return;
    
    try {
      const response = await fetch(`/api/representatives/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete representative");
      }
      
      setRepresentatives(reps => reps.filter(rep => rep.id !== id));
      
      toast({
        title: "نماینده حذف شد",
        description: "نماینده با موفقیت حذف شد",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "حذف نماینده با مشکل مواجه شد",
      });
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/representatives/${id}/edit`);
  };
  
  const filteredData = representatives.filter(
    (rep) =>
      rep.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.nationalId.includes(searchTerm) ||
      rep.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو نام، کد ملی یا شهر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <AddRepresentativeButton />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden space-y-4 p-4">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            هیچ نماینده‌ای یافت نشد.
          </div>
        ) : (
          filteredData.map((rep) => (
            <div key={rep.id} className="bg-card p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={rep.profileImage || ""} alt={`${rep.firstName} ${rep.lastName}`} />
                  <AvatarFallback>{rep.firstName.charAt(0)}{rep.lastName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{`${rep.firstName} ${rep.lastName}`}</p>
                  <p className="text-sm text-muted-foreground">{rep.nationalId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">شماره موبایل:</span>
                  <p>{rep.phoneNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">شهر:</span>
                  <p>{rep.city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">مرکز آموزشی:</span>
                  <p>{rep.educationCenter}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">وضعیت:</span>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={rep.isActive} 
                      onCheckedChange={(checked) => handleStatusChange(rep.id, checked)}
                    />
                    <Badge variant={rep.isActive ? "outline" : "secondary"} className={rep.isActive ? "bg-success/10 text-success border-success" : ""}>
                      {rep.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/representatives/${rep.id}`)}
                >
                  <Eye className="h-4 w-4 ml-2" />
                  مشاهده جزئیات
                </Button>
                <EditRepresentativeDialog representative={rep} />
                <DeleteRepresentativeDialog representative={rep} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="rounded-md border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>مشخصات</TableHead>
                <TableHead>کد ملی</TableHead>
                <TableHead>شماره موبایل</TableHead>
                <TableHead>شهر</TableHead>
                <TableHead>مرکز آموزشی</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    هیچ نماینده‌ای یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((rep) => (
                  <TableRow key={rep.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={rep.profileImage || ""} alt={`${rep.firstName} ${rep.lastName}`} />
                          <AvatarFallback>{rep.firstName.charAt(0)}{rep.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{`${rep.firstName} ${rep.lastName}`}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{rep.nationalId}</TableCell>
                    <TableCell>{rep.phoneNumber}</TableCell>
                    <TableCell>{rep.city}</TableCell>
                    <TableCell>{rep.educationCenter}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={rep.isActive} 
                          onCheckedChange={(checked) => handleStatusChange(rep.id, checked)}
                        />
                        <Badge variant={rep.isActive ? "outline" : "secondary"} className={rep.isActive ? "bg-success/10 text-success border-success" : ""}>
                          {rep.isActive ? "فعال" : "غیرفعال"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/representatives/${rep.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-2" />
                          مشاهده جزئیات
                        </Button>
                        <EditRepresentativeDialog representative={rep} />
                        <DeleteRepresentativeDialog representative={rep} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}