import { DashboardStats } from "@/components/admin/dashboard-stats";
import { RecentOrders } from "@/components/admin/recent-orders";
import { ActiveRepresentatives } from "@/components/admin/active-representatives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="reports">گزارش‌ها</TabsTrigger>
          <TabsTrigger value="activity">فعالیت‌ها</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>سفارشات اخیر</CardTitle>
                <CardDescription>
                  آخرین سفارشات ثبت شده توسط نمایندگان
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentOrders />
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>نمایندگان فعال</CardTitle>
                <CardDescription>
                  لیست نمایندگان با بیشترین فعالیت
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveRepresentatives />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>گزارش‌ها</CardTitle>
              <CardDescription>
                گزارش‌های آماری و تحلیلی سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">این بخش در حال توسعه است.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>فعالیت‌ها</CardTitle>
              <CardDescription>
                فعالیت‌های اخیر در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">این بخش در حال توسعه است.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}