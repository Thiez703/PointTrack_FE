'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AuthService } from '@/app/services/auth.service'
import {
  ForgotPasswordSchema, ForgotPasswordFormValues,
  VerifyOtpSchema, VerifyOtpFormValues,
  ConfirmResetPasswordSchema, ConfirmResetPasswordFormValues,
} from '@/app/types/auth.schema'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Phone, ShieldCheck, Lock } from 'lucide-react'
import Link from 'next/link'

type Step = 'phone' | 'otp' | 'newPassword'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Phone form
  const phoneForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  // Step 2: OTP form
  const otpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: { phoneNumber: '', otp: '' }
  })

  // Step 3: New password form
  const passwordForm = useForm<ConfirmResetPasswordFormValues>({
    resolver: zodResolver(ConfirmResetPasswordSchema),
  })

  // Step 1 Submit: Gửi OTP đến SĐT
  const handleSendOtp = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      await AuthService.forgotPassword(values.phoneNumber)
      setPhoneNumber(values.phoneNumber)
      otpForm.setValue('phoneNumber', values.phoneNumber)
      setStep('otp')
      toast.success('OTP đã được gửi đến số điện thoại của bạn')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 Submit: Xác thực OTP
  const handleVerifyOtp = async (values: VerifyOtpFormValues) => {
    setIsLoading(true)
    try {
      const response = await AuthService.verifyOtp(values.phoneNumber, values.otp)
      setResetToken(response.data.resetToken)
      setStep('newPassword')
      toast.success('Xác thực OTP thành công')
    } catch (error: any) {
      toast.error(error.message || 'OTP không đúng hoặc đã hết hạn')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3 Submit: Đặt mật khẩu mới
  const handleResetPassword = async (values: ConfirmResetPasswordFormValues) => {
    setIsLoading(true)
    try {
      await AuthService.resetPasswordWithToken({
        resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none rounded-3xl overflow-hidden">
        <div className="bg-orange-500 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
             {step === 'phone' && <Phone className="w-8 h-8" />}
             {step === 'otp' && <ShieldCheck className="w-8 h-8" />}
             {step === 'newPassword' && <Lock className="w-8 h-8" />}
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight">
            {step === 'phone' && 'Quên mật khẩu'}
            {step === 'otp' && 'Xác thực OTP'}
            {step === 'newPassword' && 'Mật khẩu mới'}
          </CardTitle>
          <CardDescription className="text-orange-100 font-medium mt-1">
            {step === 'phone' && 'Nhập SĐT để nhận mã khôi phục'}
            {step === 'otp' && `Nhập mã 6 số đã gửi tới ${phoneNumber}`}
            {step === 'newPassword' && 'Thiết lập mật khẩu truy cập mới'}
          </CardDescription>
        </div>

        <CardContent className="p-8">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            {(['phone', 'otp', 'newPassword'] as Step[]).map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                step === s ? 'bg-orange-500 w-full' : 
                (['phone', 'otp', 'newPassword'].indexOf(step) > i) 
                  ? 'bg-orange-200' : 'bg-gray-100'
              }`} />
            ))}
          </div>

          {/* Step 1: Nhập SĐT */}
          {step === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-[11px] font-black uppercase tracking-widest text-gray-400">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phoneNumber"
                    placeholder="0912345678"
                    className="pl-10 h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-bold"
                    {...phoneForm.register('phoneNumber')}
                  />
                </div>
                {phoneForm.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-xs font-bold mt-1">
                    {phoneForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl font-black shadow-lg shadow-orange-100 uppercase tracking-wider">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tiếp tục'}
              </Button>
            </form>
          )}

          {/* Step 2: Nhập OTP */}
          {step === 'otp' && (
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 block text-center">Mã xác thực (6 chữ số)</Label>
                <Input
                  placeholder="______"
                  maxLength={6}
                  autoFocus
                  className="h-16 text-center text-3xl tracking-[0.5em] font-black rounded-2xl border-orange-100 bg-orange-50/30 focus:bg-white focus:ring-orange-500"
                  {...otpForm.register('otp')}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-red-500 text-xs font-bold text-center">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl font-black shadow-lg shadow-orange-100 uppercase tracking-wider">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận OTP'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('phone')}
                  className="w-full text-gray-400 hover:text-orange-500 font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Thay đổi số điện thoại
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Mật khẩu mới */}
          {step === 'newPassword' && (
            <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Mật khẩu mới</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-bold"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-xs font-bold">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Xác nhận mật khẩu</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-bold"
                    {...passwordForm.register('confirmPassword')}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs font-bold">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl font-black shadow-lg shadow-orange-100 uppercase tracking-wider mt-4">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đặt lại mật khẩu'}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50/50 p-6 flex justify-center border-t border-gray-100">
          <Link href="/login" className="flex items-center text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đăng nhập
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

