"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, Loader2, Save, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { AdminService } from "@/app/services/admin.service";
import { FileService } from "@/app/services/file.service";
import { CreateEmployeeSchema, CreateEmployeeRequest, SalaryLevel } from "@/app/types/admin.schema";
import { FormTextField } from "@/components/form-control/FormTextField";
import { FormCheckboxGroup } from "@/components/form-control/FormCheckboxGroup";
import AvatarUpload from "@/components/file-upload/avatar-upload";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const SKILLS = [
  { id: "tam_be", name: "Tắm bé" },
  { id: "ve_sinh", name: "Vệ sinh nhà" },
  { id: "nau_an", name: "Nấu ăn" },
  { id: "giat_ui", name: "Giặt ủi" },
  { id: "trong_tre", name: "Trông trẻ" },
  { id: "cham_soc_nguoi_cao_tuoi", name: "Chăm sóc người cao tuổi" },
];

export default function CreateEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: salaryLevelsData } = useQuery({
    queryKey: ["admin", "salary-levels"],
    queryFn: () => AdminService.getSalaryLevels(),
  });

  const salaryLevels = salaryLevelsData?.data || [];

  const form = useForm<CreateEmployeeRequest>({
    resolver: zodResolver(CreateEmployeeSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      skills: [],
      area: "",
    },
  });

  const onSubmit = async (values: CreateEmployeeRequest) => {
    setIsSubmitting(true);
    // Log payload để debug trước khi gửi
    console.log("Submitting employee data:", values);
    
    try {
      const response = await AdminService.createEmployee(values);
      if (response.success) {
        toast.success("Tạo nhân viên thành công!");
        toast.info("Mật khẩu tạm đã được gửi tới email nhân viên");
        setTimeout(() => {
          router.push("/admin/personnel");
        }, 1500);
      } else {
        toast.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Create employee error:", error);
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409) {
        const detail = data?.detail || data?.message || "";
        console.warn("Conflict detected:", detail);
        
        // Kiểm tra từ khóa trong thông báo lỗi từ BE để gán lỗi vào đúng field
        const lowerDetail = detail.toLowerCase();
        if (lowerDetail.includes("số điện thoại") || lowerDetail.includes("phone")) {
          form.setError("phone", { message: "Số điện thoại này đã tồn tại trong hệ thống" });
          toast.error("Trùng lặp số điện thoại");
        } else if (lowerDetail.includes("email")) {
          form.setError("email", { message: "Email này đã tồn tại trong hệ thống" });
          toast.error("Trùng lặp địa chỉ email");
        } else {
          toast.error(detail || "Dữ liệu bị trùng lặp, vui lòng kiểm tra lại");
        }
      } else if (status === 400 && data?.fieldErrors) {
        data.fieldErrors.forEach((err: string) => {
          const [field, ...messageParts] = err.split(": ");
          const message = messageParts.join(": ");
          if (field && message) {
            form.setError(field as any, { message });
          }
        });
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file) {
      form.setValue("avatarUrl", undefined);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await FileService.tmpUpload(formData);
      if (result.data?.url) {
        form.setValue("avatarUrl", result.data.url);
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Không thể tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-orange-50 hover:text-orange-600 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Tạo Nhân Viên Mới</h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Thông tin nhân sự</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Avatar Upload */}
            <Card className="md:col-span-1 rounded-3xl border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden h-fit">
              <CardHeader className="bg-gray-50/50 border-b border-gray-50">
                <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <AvatarUpload 
                  onFileChange={(fileWithPreview) => {
                    if (fileWithPreview && fileWithPreview.file instanceof File) {
                      handleAvatarChange(fileWithPreview.file);
                    } else {
                      handleAvatarChange(null);
                    }
                  }}
                />
                {isUploading && (
                  <div className="mt-4 flex items-center justify-center text-xs text-orange-600 font-bold animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                    Đang tải ảnh...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column: Basic Info */}
            <Card className="md:col-span-2 rounded-3xl border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-50">
                <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextField
                  control={form.control}
                  name="fullName"
                  label="Họ và tên *"
                  placeholder="Nguyễn Văn A"
                  className="rounded-2xl border-gray-100 focus:ring-orange-200"
                />
                <FormTextField
                  control={form.control}
                  name="phone"
                  label="Số điện thoại *"
                  placeholder="0901234567"
                  className="rounded-2xl border-gray-100 focus:ring-orange-200"
                />
                <div className="md:col-span-2">
                  <FormTextField
                    control={form.control}
                    name="email"
                    label="Email *"
                    placeholder="nva@gmail.com"
                    className="rounded-2xl border-gray-100 focus:ring-orange-200"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Info Section */}
          <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50">
              <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Thông tin công việc</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="salaryLevelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cấp bậc lương</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl border-gray-100 focus:ring-orange-200 h-11 font-medium">
                          <SelectValue placeholder="Chọn cấp bậc lương" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-gray-100">
                        {salaryLevels.map((level: SalaryLevel) => (
                          <SelectItem key={level.id} value={level.id.toString()} className="rounded-xl font-medium focus:bg-orange-50 focus:text-orange-600">
                            {level.name} - {level.baseSalary.toLocaleString()}đ
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hiredDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1.5">Ngày vào làm</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-medium rounded-2xl border-gray-100 h-11 hover:bg-orange-50 hover:border-orange-100 transition-colors",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-gray-100 shadow-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={vi}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormTextField
                control={form.control}
                name="area"
                label="Khu vực"
                placeholder="Quận 1, TP. HCM"
                className="rounded-2xl border-gray-100 focus:ring-orange-200"
              />
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="rounded-3xl border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-50">
              <CardTitle className="text-sm font-black text-gray-400 uppercase tracking-widest">Kỹ năng chuyên môn</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormCheckboxGroup
                  control={form.control}
                  name="skills"
                  options={SKILLS}
                  valueKey="id"
                  labelKey="name"
                  renderOption={(option) => (
                    <FormLabel className="cursor-pointer font-bold text-gray-700 text-sm">{option.name}</FormLabel>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 pb-12">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="rounded-2xl border-gray-200 font-black text-gray-400 px-8 h-12 hover:bg-gray-50 transition-all uppercase tracking-widest text-xs"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black px-10 h-12 shadow-lg shadow-orange-200 transition-all uppercase tracking-widest text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo Nhân Viên
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
