import {
  format,
  formatDistance,
  formatRelative,
  isToday,
  isYesterday,
} from "date-fns-jalali";

export function formatJalaliDate(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "-";
    }
    
    return format(dateObj, "yyyy/MM/dd");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

export function formatJalaliDateTime(date: Date | string | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(dateObj, "yyyy/MM/dd HH:mm:ss");
}

export function formatRelativeJalaliDate(date: Date | string | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `امروز، ${format(dateObj, "HH:mm")}`;
  }
  
  if (isYesterday(dateObj)) {
    return `دیروز، ${format(dateObj, "HH:mm")}`;
  }
  
  return formatRelative(dateObj, new Date());
}

export function formatDistanceJalali(date: Date | string | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}