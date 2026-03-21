"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Plus,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  CalendarDays,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AttendanceService } from "@/app/services/attendance.service";
import { UserService } from "@/app/services/user.service";
import { UserType } from "@/app/types/user.schema";
import { WorkScheduleResponse } from "@/app/types/attendance.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateSchedulePage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [schedules, setSchedules] = useState<WorkScheduleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [workDate, setWorkDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState<string>("08:00:00");
  const [endTime, setEndTime] = useState<string>("17:00:00");
  const [address, setAddress] = useState<string>("KCN Tân Bình, TP.HCM");
  const [lat, setLat] = useState<string>("10.8067");
  const [lng, setLng] = useState<string>("106.6286");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userData, scheduleData] = await Promise.all([
        UserService.getAll(),
        AttendanceService.getAllSchedules(),
      ]);
      setUsers(userData);
      if (scheduleData.success) {
        setSchedules(scheduleData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu, vui lòng kiểm tra BE");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    setSubmitting(true);
    try {
      const res = await AttendanceService.createSchedule({
        userId: Number(selectedUserId),
        workDate,
        startTime,
        endTime,
        address,
        lat: Number(lat),
        lng: Number(lng),
      });

      if (res.success) {
        toast.success("Tạo ca làm việc thành công!");
        fetchData(); // Refresh list
      } else {
        toast.error(res.message || "Tạo ca thất bại");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi hệ thống máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý Ca làm việc</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Admin Panel • PointTrack
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-sm sticky top-24 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                <Plus className="w-5 h-5 text-teal-600" />
                Thêm ca mới
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Nhân viên
                  </Label>
                  <Select
                    onValueChange={setSelectedUserId}
                    defaultValue={selectedUserId}
                  >
                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-teal-500 text-slate-900">
                      <SelectValue placeholder="Chọn nhân viên..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-900">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)} className="focus:bg-slate-100">
                          {user.displayName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Ngày làm việc
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="date"
                      value={workDate}
                      onChange={(e) => setWorkDate(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Bắt đầu
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="08:00:00"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Kết thúc
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="17:00:00"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-500">
                    Địa điểm (Address)
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Latitude
                    </Label>
                    <Input
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      Longitude
                    </Label>
                    <Input
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-teal-100 transition-all mt-4"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-white" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 mr-2 text-white" />
                  )}
                  Xác nhận tạo ca
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-teal-600" />
              Danh sách ca làm việc
            </h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm nhân viên..."
                className="pl-10 h-9 bg-white border-slate-200 text-sm text-slate-900"
              />
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    ID
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Nhân viên
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Ngày
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Thời gian
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Địa điểm
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-10 text-slate-400 italic"
                    >
                      Chưa có ca làm việc nào được tạo.
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-mono text-xs text-slate-400">
                        #{item.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-[10px]">
                            {item.userName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-700 text-sm">
                            {item.userName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-600">
                        {item.workDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-teal-600">
                            {item.startTime}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            đến {item.endTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-[150px]">
                          <span className="text-xs font-medium text-slate-600 truncate">
                            {item.address}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.lat}, {item.lng}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
