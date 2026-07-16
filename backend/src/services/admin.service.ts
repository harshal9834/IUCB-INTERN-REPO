import { AdminRepository } from "../repositories/admin.repository.js";
import { Admin } from "@prisma/client";

export class AdminService {
  private adminRepository = new AdminRepository();

  async getAdminById(id: string): Promise<Admin | null> {
    return this.adminRepository.findById(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | null> {
    return this.adminRepository.findByEmail(email);
  }

  async createAdmin(data: any): Promise<Admin> {
    return this.adminRepository.create(data);
  }
}
export default AdminService;
