import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async ensureSuperAdmin(): Promise<void> {
    const has = await this.repo.findOne({
      where: { role: UserRole.SUPER_ADMIN },
      select: ['id'],
    });
    if (has) return;

    const email = this.config
      .get<string>('SUPER_ADMIN_EMAIL', 'superadmin@shop.co')
      .trim()
      .toLowerCase();
    const password = this.config.get<string>('SUPER_ADMIN_PASSWORD', '1234');
    const passwordHash = await bcrypt.hash(password, 10);
    await this.repo.save(
      this.repo.create({
        email,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      }),
    );
  }

  async createUser(
    email: string,
    password: string,
    role: UserRole,
  ): Promise<User> {
    const normalized = email.trim().toLowerCase();
    const dup = await this.repo.findOne({
      where: { email: normalized },
      select: ['id'],
    });
    if (dup) {
      throw new ConflictException('Bu email allaqachon band.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return this.repo.save(
      this.repo.create({
        email: normalized,
        passwordHash,
        role,
      }),
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdOrThrow(id: number): Promise<User> {
    const u = await this.findById(id);
    if (!u) throw new NotFoundException('Foydalanuvchi topilmadi');
    return u;
  }
}
