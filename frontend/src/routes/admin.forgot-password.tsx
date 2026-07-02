import { createFileRoute } from "@tanstack/react-router";
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
import { Mail, CheckCircle, ShieldAlert, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/admin/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await axiosInstance.post("/auth/forgot-password", {
        email: data.email,
      });
      setIsSuccess(true);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to process request. Please try again.",
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
              <Mail className="h-6 w-6 text-[#D4AF37]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0F2942]">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-500">
            Enter your email to receive recovery instructions
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4 py-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Request Received</h3>
            <p className="text-sm text-slate-600">
              If the email address matches an active account, password recovery instructions will be
              dispatched.
            </p>
            <div className="pt-4">
              <a
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F2942] hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </a>
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
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@iucb.org"
                    className="pl-10 border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full bg-[#0F2942] text-white hover:bg-[#1a446c] focus:ring-[#0F2942] transition-all font-semibold py-2"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
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
