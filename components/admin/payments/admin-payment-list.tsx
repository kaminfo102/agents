"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatJalaliDate } from "@/lib/date-utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Payment {
  id: string;
  orderNumber: string;
  orderDate: string;
  paymentDate: string;
  amount: number;
  receiptImage: string;
  agent: {
    firstName: string;
    lastName: string;
  };
}

const ITEMS_PER_PAGE = 10;

export function AdminPaymentList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "دریافت اطلاعات پرداخت‌ها با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPayments = payments.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">ردیف</TableHead>
                <TableHead>شماره سفارش</TableHead>
                <TableHead>نام نماینده</TableHead>
                <TableHead>تاریخ سفارش</TableHead>
                <TableHead>تاریخ پرداخت</TableHead>
                <TableHead>مبلغ پرداخت</TableHead>
                <TableHead>رسید پرداخت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center"><Skeleton className="h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-16 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">ردیف</TableHead>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>نام نماینده</TableHead>
              <TableHead>تاریخ سفارش</TableHead>
              <TableHead>تاریخ پرداخت</TableHead>
              <TableHead>مبلغ پرداخت</TableHead>
              <TableHead>رسید پرداخت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPayments.map((payment, index) => (
              <TableRow key={payment.id}>
                <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                <TableCell>{payment.orderNumber}</TableCell>
                <TableCell>
                  {payment.agent.firstName} {payment.agent.lastName}
                </TableCell>
                <TableCell>{formatJalaliDate(payment.orderDate)}</TableCell>
                <TableCell>{formatJalaliDate(payment.paymentDate)}</TableCell>
                <TableCell>{payment.amount.toLocaleString()} تومان</TableCell>
                <TableCell>
                  {payment.receiptImage && (
                    <div className="relative w-16 h-16">
                      <Image
                        src={payment.receiptImage}
                        alt="رسید پرداخت"
                        fill
                        className="object-cover rounded-md cursor-pointer"
                        onClick={() => window.open(payment.receiptImage, '_blank')}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {currentPayments.map((payment, index) => (
          <Card key={payment.id} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Summary View */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {payment.agent.firstName} {payment.agent.lastName}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(payment.id)}
                    className="h-8 w-8"
                  >
                    {expandedItems.has(payment.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{formatJalaliDate(payment.paymentDate)}</span>
                  <span className="font-medium text-foreground">
                    {payment.amount.toLocaleString()} تومان
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedItems.has(payment.id) && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">شماره سفارش:</span>
                    <span className="font-medium">{payment.orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">تاریخ سفارش:</span>
                    <span className="font-medium">{formatJalaliDate(payment.orderDate)}</span>
                  </div>
                  {payment.receiptImage && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">رسید پرداخت:</span>
                      <div className="relative w-16 h-16">
                        <Image
                          src={payment.receiptImage}
                          alt="رسید پرداخت"
                          fill
                          className="object-cover rounded-md cursor-pointer"
                          onClick={() => window.open(payment.receiptImage, '_blank')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent className="flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page as number);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
} 