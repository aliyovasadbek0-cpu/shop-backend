import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SuperAdminSeeder implements OnModuleInit {
  private readonly log = new Logger(SuperAdminSeeder.name);

  constructor(private readonly users: UsersService) {}

  async onModuleInit() {
    try {
      await this.users.ensureSuperAdmin();
      this.log.log('Super admin tekshiruvi yakunlandi');
    } catch (e) {
      this.log.error(e);
    }
  }
}
