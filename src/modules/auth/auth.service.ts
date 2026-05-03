import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../../entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.createUser(
      dto.email,
      dto.password,
      UserRole.USER,
    );
    return this.buildTokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Email yoki parol noto‘g‘ri');
    }
    return this.buildTokenResponse(user);
  }

  async createAdmin(actorRole: UserRole, dto: CreateAdminDto) {
    if (actorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Faqat super admin yangi admin yarata oladi');
    }
    const user = await this.users.createUser(
      dto.email,
      dto.password,
      UserRole.ADMIN,
    );
    return { id: user.id, email: user.email, role: user.role };
  }

  private buildTokenResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = this.jwt.sign(payload);
    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
