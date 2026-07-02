import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { axiosInstance } from "../services/api/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute("/admin/reset-password")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
    };
  },
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: search.token || "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await axiosInstance.post("/auth/reset-password", {
        token: data.token,
        password: data.password,
      });
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
          "Invalid or expired token. Please request another reset link.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F2942]">
              <Lock className="h-6 w-6 text-[#D4AF37]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0F2942]">
            New Password
          </CardTitle>
          <CardDescription className="text-slate-500">
            Set your new administrative password
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4 py-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Success!</h3>
            <p className="text-sm text-slate-600 font-medium">
              Your password has been successfully updated. All other active sessions have been
              forced to log out for security.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => navigate({ to: "/admin/login" })}
                className="w-full bg-[#0F2942] text-white hover:bg-[#1a446c]"
              >
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="token" className="text-slate-700 font-medium">
                  Reset Token
                </Label>
                <Input
                  id="token"
                  placeholder="Paste secure token received"
                  className="border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                  disabled={isLoading || !!search.token}
                  {...register("token")}
                />
                {errors.token && (
                  <p className="text-xs text-red-600 font-medium">{errors.token.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="pr-10 border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  className="border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-[#0F2942] text-white hover:bg-[#1a446c] focus:ring-[#0F2942] transition-all font-semibold py-2"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Change Password"}
              </Button>
              <div className="text-center">
                <a
                  href="/admin/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F2942] hover:text-[#D4AF37] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
                </a>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
