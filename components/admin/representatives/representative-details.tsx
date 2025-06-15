"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { RepresentativeForm } from "./representative-form";

interface RepresentativeDetailsProps {
  representativeId: string;
}

export function RepresentativeDetails({ representativeId }: RepresentativeDetailsProps) {
  const [representative, setRepresentative] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch representative data
  useEffect(() => {
    const fetchRepresentative = async () => {
      try {
        const response = await fetch(`/api/representatives/${representativeId}`);
        if (!response.ok) throw new Error("Failed to fetch representative");
        const data = await response.json();
        setRepresentative(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "خطا",
          description: "خطا در دریافت اطلاعات نماینده",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentative();
  }, [representativeId, toast]);

  // Handle file upload
  const handleFileUpload = async (file: File, type: "document" | "contract") => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch(`/api/representatives/${representativeId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file");

      toast({
        title: "موفق",
        description: "فایل با موفقیت آپلود شد",
      });

      // Refresh representative data
      const updatedResponse = await fetch(`/api/representatives/${representativeId}`);
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        setRepresentative(updatedData);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطا",
        description: "خطا در آپلود فایل",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!representative) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">نماینده مورد نظر یافت نشد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Button>
      </div>

      <Tabs defaultValue="info" className="space-y-4" dir="rtl">
        <div className="w-full flex justify-end">
          <TabsList className="inline-flex">
            <TabsTrigger value="contracts">قراردادها</TabsTrigger>
            <TabsTrigger value="documents">مدارک</TabsTrigger>
            <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ویرایش اطلاعات نماینده</CardTitle>
              <CardDescription>
                اطلاعات پایه نماینده را ویرایش کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RepresentativeForm initialData={representative} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مدارک نماینده</CardTitle>
              <CardDescription>
                مدارک و فایل‌های پیوست شده به نماینده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("document-upload")?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="mr-2">آپلود مدرک جدید</span>
                  </Button>
                  <input
                    id="document-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "document");
                    }}
                  />
                </div>

                <div className="grid gap-4">
                  {representative?.documents?.map((doc: any) => (
                    <Card key={doc.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.fileUrl, "_blank")}
                        >
                          دانلود
                        </Button>
                        <div className="flex items-center gap-4 text-right">
                          <FileText className="h-8 w-8" />
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قراردادهای نماینده</CardTitle>
              <CardDescription>
                قراردادهای منعقد شده با نماینده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("contract-upload")?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="mr-2">آپلود قرارداد جدید</span>
                  </Button>
                  <input
                    id="contract-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "contract");
                    }}
                  />
                </div>

                <div className="grid gap-4">
                  {representative?.contracts?.map((contract: any) => (
                    <Card key={contract.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(contract.fileUrl, "_blank")}
                            >
                              دانلود
                            </Button>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              contract.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                              contract.status === "EXPIRED" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {contract.status === "ACTIVE" ? "فعال" :
                               contract.status === "EXPIRED" ? "منقضی شده" :
                               "در انتظار تایید"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-right">
                            <FileText className="h-8 w-8" />
                            <div>
                              <p className="font-medium">{contract.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {contract.description}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                از {format(new Date(contract.startDate), "PPP", { locale: faIR })} تا{" "}
                                {format(new Date(contract.endDate), "PPP", { locale: faIR })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 