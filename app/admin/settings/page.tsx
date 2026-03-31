"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GracePeriodSchema } from "@/app/types/admin.schema";
import { toast } from "sonner";
import { Settings, Clock, AlertTriangle, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => AdminService.getSettings(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(GracePeriodSchema),
    values: {
      gracePeriodMinutes: settings?.data?.gracePeriodMinutes || 0,
    }
  });

  const mutation = useMutation({
    mutationFn: (data: { gracePeriodMinutes: number }) => AdminService.updateGracePeriod(data),
    onSuccess: () => toast.success("Cập nhật cấu hình thành công!"),
  });

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
           <Settings className="w-8 h-8 text-orange-500" />
           Cấu hình Hệ thống
        </h2>
        <p className="text-gray-400 font-medium mt-2">Thiết lập các quy tắc chấm công và tính lương toàn hệ thống.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Grace Period Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-orange-600 font-black uppercase tracking-widest text-xs">
             <Clock className="w-5 h-5" />
             Thời gian đệm (Grace Period)
          </div>
          
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
             <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Số phút cho phép đi muộn / về sớm</label>
                <input 
                  type="number" 
                  {...register("gracePeriodMinutes", { valueAsNumber: true })}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 font-bold text-gray-800 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                {errors.gracePeriodMinutes && <p className="text-red-500 text-[11px] mt-1 font-bold">{errors.gracePeriodMinutes.message}</p>}
             </div>

             <button 
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-orange-100 active:scale-95 disabled:opacity-50"
             >
                <Save className="w-5 h-5" />
                LƯU CẤU HÌNH
             </button>
          </form>
        </div>

        {/* Penalty Rules */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center gap-3 text-red-600 font-black uppercase tracking-widest text-xs">
             <AlertTriangle className="w-5 h-5" />
             Quy tắc phạt vi phạm
           </div>
           
           <div className="space-y-4">
              {settings?.data?.penaltyRules && settings.data.penaltyRules.length > 0 ? (
                settings.data.penaltyRules.map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">Đi muộn {'>'} {rule.minLateMinutes}p</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Khấu trừ lương ca</span>
                    </div>
                    <span className="text-red-600 font-black text-sm">{rule.deductionPercent}%</span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center space-y-3 opacity-50 grayscale pointer-events-none">
                  {[
                    { name: "Đi muộn > 15p", fine: "5%" },
                    { name: "Đi muộn > 30p", fine: "10%" },
                    { name: "Vắng mặt", fine: "100%" },
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                       <span className="font-bold text-gray-700 text-sm">{rule.name}</span>
                       <span className="text-red-600 font-black text-sm">{rule.fine}</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full border-2 border-dashed border-gray-200 text-gray-400 font-bold py-4 rounded-2xl hover:border-orange-200 hover:text-orange-500 transition-all text-sm uppercase tracking-widest">
                 + Cập nhật quy tắc
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
