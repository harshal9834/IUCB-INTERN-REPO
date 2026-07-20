import { Router, Request, Response } from "express";
import { z } from "zod";
import asyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import EmailService from "../services/email.service.js";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email address is required"),
  org: z.string().optional().nullable().or(z.literal("")),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(5, "Message is required"),
});

// POST /api/v1/contact
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const body = contactSchema.parse(req.body);

    try {
      await EmailService.sendContactMessageToAdmin({
        name: body.name,
        email: body.email,
        org: body.org || undefined,
        subject: body.subject,
        message: body.message,
      });
    } catch (err) {
      console.error("[ContactRoute] Failed to dispatch email to admin:", err);
    }

    res.status(200).json(
      new ApiResponse(200, {}, "Contact message sent successfully to admin"),
    );
  }),
);

export default router;
