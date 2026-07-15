import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/Database.js";
import { AuthService } from "../services/auth.service.js";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../validators/auth.validators.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { EmailService } from "../services/email.service.js";

const authService = new AuthService();

// Cookie option settings
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  // LOGIN
  login = asyncHandler(async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email: body.email },
    });

    if (!admin || admin.deletedAt !== null) {
      // Log FAILED_LOGIN
      await authService.logAudit(null, "ADMIN", "NONE", "FAILED_LOGIN", req.ip || null, req.headers["user-agent"] || null, { email: body.email });

      throw new ApiError(401, "Invalid email or password");
    }

    if (admin.status !== "ACTIVE") {
      throw new ApiError(403, "Your account is suspended or inactive");
    }

    const isMatch = await bcrypt.compare(body.password, admin.password);
    if (!isMatch) {
      await authService.logAudit(null, "ADMIN", admin.id, "FAILED_LOGIN", req.ip || null, req.headers["user-agent"] || null, { email: body.email });

      throw new ApiError(401, "Invalid email or password");
    }

    // Update lastLogin
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const accessToken = authService.generateAccessToken(admin);
    const refreshToken = await authService.generateRefreshToken(admin.id);

    // Set Refresh Token as HTTP-Only Cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    // Log LOGIN
    await authService.logAudit(admin.id, "ADMIN", admin.id, "LOGIN", req.ip || null, req.headers["user-agent"] || null);

    if (admin.role === "SUPER_ADMIN") {

    }

    const { password, ...adminWithoutPassword } = admin;

    res.status(200).json(
      new ApiResponse(200, {
        accessToken,
        admin: adminWithoutPassword,
      }, "Logged in successfully")
    );
  });

  // LOGOUT
  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (token) {
      // Decode user if possible to register audit logs
      try {
        const decoded = jwt.decode(req.headers.authorization?.split(" ")[1] || "") as any;
        if (decoded?.id) {
          await authService.logAudit(decoded.id, "ADMIN", decoded.id, "LOGOUT", req.ip || null, req.headers["user-agent"] || null);
        }
      } catch (err) {}

      await authService.invalidateRefreshToken(token);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  });

  // GET CURRENT PROFILE
  me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) {
      throw new ApiError(401, "User session not verified");
    }
    res.status(200).json(new ApiResponse(200, { admin: req.admin }, "Profile fetched successfully"));
  });

  // REFRESH TOKEN ROTATION
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new ApiError(401, "Refresh token is missing");
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.deleteMany({ where: { id: storedToken.id } });
      }
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const admin = await prisma.admin.findUnique({
      where: { id: storedToken.adminId },
    });

    if (!admin || admin.status !== "ACTIVE" || admin.deletedAt !== null) {
      throw new ApiError(401, "Admin account associated with token is invalid");
    }

    // Rotate refresh token
    const newAccessToken = authService.generateAccessToken(admin);
    const newRefreshToken = await authService.generateRefreshToken(admin.id);

    // Remove old token (deleteMany avoids P2025 if already rotated/deleted)
    await prisma.refreshToken.deleteMany({ where: { id: storedToken.id } });

    // Set new token in cookie
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    res.status(200).json(
      new ApiResponse(200, {
        accessToken: newAccessToken,
      }, "Token refreshed successfully")
    );
  });

  // FORGOT PASSWORD
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const body = forgotPasswordSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email: body.email },
    });

    if (!admin || admin.deletedAt !== null) {
      // Silently return success to prevent user enumeration attacks
      res.status(200).json(new ApiResponse(200, null, "If email exists in our system, a reset link will be sent"));
      return;
    }

    // Generate random reset token (using SystemSettings as a temporary store or custom fields)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    // Save hashed token to SystemSettings using a specific formatting standard
    // E.g., Key format: reset_token_{adminId}
    await prisma.systemSettings.upsert({
      where: { key: `reset_${admin.id}` },
      update: { value: JSON.stringify({ token: hashedResetToken, expires: expiry.getTime() }) },
      create: { key: `reset_${admin.id}`, value: JSON.stringify({ token: hashedResetToken, expires: expiry.getTime() }) },
    });

    // Send Email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await EmailService.sendPasswordResetEmail({
      to: admin.email,
      adminName: admin.fullName,
      resetLink,
    });

    // For local verification, return resetToken in data when not in production environment
    const verificationData = process.env.NODE_ENV !== "production" ? { resetToken } : null;

    res.status(200).json(
      new ApiResponse(200, verificationData, "Reset instructions generated successfully")
    );
  });

  // RESET PASSWORD
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const body = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash("sha256").update(body.token).digest("hex");

    // Search settings keys for matching reset values
    const resetSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          startsWith: "reset_",
        },
      },
    });

    let matchedAdminId: string | null = null;
    let settingIdToRemove: string | null = null;

    for (const setting of resetSettings) {
      try {
        const payload = JSON.parse(setting.value);
        if (payload.token === tokenHash) {
          if (payload.expires > Date.now()) {
            matchedAdminId = setting.key.replace("reset_", "");
            settingIdToRemove = setting.id;
          }
          break;
        }
      } catch (err) {}
    }

    if (!matchedAdminId || !settingIdToRemove) {
      throw new ApiError(400, "Reset token is invalid or expired");
    }

    const admin = await prisma.admin.findUnique({
      where: { id: matchedAdminId },
    });

    if (!admin || admin.deletedAt !== null) {
      throw new ApiError(404, "Account not found");
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(body.password, salt);

    await prisma.$transaction([
      prisma.admin.update({
        where: { id: admin.id },
        data: { password: newHashedPassword },
      }),
      prisma.systemSettings.delete({
        where: { id: settingIdToRemove },
      }),
    ]);

    // Force sign-out of all active sessions
    await authService.invalidateAllAdminTokens(admin.id);

    // Log PASSWORD_RESET
    await authService.logAudit(admin.id, "ADMIN", admin.id, "PASSWORD_RESET", req.ip || null, req.headers["user-agent"] || null);

    res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
  });

  // CHANGE PASSWORD (when logged in)
  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) {
      throw new ApiError(401, "Not authenticated");
    }

    const body = changePasswordSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    if (!admin) {
      throw new ApiError(404, "User profile not found");
    }

    const isMatch = await bcrypt.compare(body.oldPassword, admin.password);
    if (!isMatch) {
      throw new ApiError(400, "Incorrect current password");
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(body.newPassword, salt);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: newHashedPassword },
    });

    // Invalidate other active sessions
    await authService.invalidateAllAdminTokens(admin.id);

    // Log PASSWORD_CHANGED
    await authService.logAudit(admin.id, "ADMIN", admin.id, "PASSWORD_CHANGED", req.ip || null, req.headers["user-agent"] || null);

    res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
  });
}
export default AuthController;
