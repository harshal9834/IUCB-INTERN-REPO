import { Request, Response } from "express";
import { AdminService } from "../services/admin.service.js";

export class AdminController {
  private adminService = new AdminService();

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = req.query.email as string;
      if (!email) {
        res.status(400).json({ error: "Email query parameter required" });
        return;
      }

      const admin = await this.adminService.getAdminByEmail(email);
      if (!admin) {
        res.status(404).json({ error: "Admin not found" });
        return;
      }

      res.status(200).json({ admin: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fullName, email, password, role, country, countryCode, phoneCode, state, city, postalCode, addressLine1, addressLine2, address } = req.body;
      if (!fullName || !email || !password) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      
      const bcrypt = await import("bcryptjs");
      const salt = await bcrypt.default.genSalt(10);
      const hashedPassword = await bcrypt.default.hash(password, salt);

      const admin = await this.adminService.createAdmin({
        fullName,
        email,
        password: hashedPassword,
        role: role || "ADMIN",
        country, countryCode, phoneCode, state, city, postalCode, addressLine1, addressLine2, address,
      });


      res.status(201).json({ success: true, admin: { id: admin.id, fullName: admin.fullName, email: admin.email, role: admin.role } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
export default AdminController;
