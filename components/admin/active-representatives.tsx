"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Representative {
  id: string;
  name: string;
  city: string;
  activity: number;
  orders: number;
  image: string | null;
}

export function ActiveRepresentatives() {
  const { toast } = useToast();
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchRepresentatives = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/active-representatives');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در دریافت اطلاعات نمایندگان');
      }
      const data = await response.json();
      setRepresentatives(data);
    } catch (error) {
      console.error('Error fetching representatives:', error);
      setError(error instanceof Error ? error.message : 'خطا در دریافت اطلاعات نمایندگان');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepresentatives();
  }, []);

  const handleClick = (id: string) => {
    toast({
      title: "نماینده انتخاب شد",
      description: "در حال انتقال به صفحه جزئیات نماینده...",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card animate-pulse"
          >
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/4" />
              <div className="h-2 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive mb-2">{error}</p>
        <button 
          onClick={fetchRepresentatives}
          className="text-sm text-primary hover:underline"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {representatives.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">هیچ نماینده‌ای یافت نشد.</p>
      ) : (
        <div className="space-y-5">
          {representatives.map((rep) => (
            <div
              key={rep.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all cursor-pointer"
              onClick={() => handleClick(rep.id)}
            >
              <Avatar>
                <AvatarImage src={rep.image || ""} alt={rep.name} />
                <AvatarFallback>{rep.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium truncate">{rep.name}</p>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {rep.orders} سفارش
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">{rep.city}</p>
                
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={rep.activity} className="h-2" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    {rep.activity}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}