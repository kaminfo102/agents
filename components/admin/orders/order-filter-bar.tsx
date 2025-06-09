"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns-jalali";
import { Calendar } from "@/components/ui/calendar";

export function OrderFilterBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const hasFilters = searchTerm || status || date;
  
  const resetFilters = () => {
    setSearchTerm("");
    setStatus(undefined);
    setDate(undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-md border shadow-sm">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="جستجو در سفارشات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>
      
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="وضعیت سفارش" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
          <SelectItem value="PENDING">در انتظار</SelectItem>
          <SelectItem value="APPROVED">تأیید شده</SelectItem>
          <SelectItem value="REJECTED">رد شده</SelectItem>
          <SelectItem value="SHIPPED">در حال ارسال</SelectItem>
          <SelectItem value="DELIVERED">تحویل شده</SelectItem>
          <SelectItem value="CANCELLED">لغو شده</SelectItem>
        </SelectContent>
      </Select>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[180px] justify-between text-right font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date ? format(date, "yyyy/MM/dd") : "انتخاب تاریخ"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
          <X className="h-4 w-4" />
          پاک کردن فیلترها
        </Button>
      )}
    </div>
  );
}