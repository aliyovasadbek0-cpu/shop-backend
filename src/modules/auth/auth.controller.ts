import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthService } from './auth.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

type AuthedRequest = Request & {
  user: { id: number; login: string; role: UserRole };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('admins')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  createAdmin(@Req() req: AuthedRequest, @Body() dto: CreateAdminDto) {
    return this.auth.createAdmin(req.user.role, dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: AuthedRequest) {
    return {
      id: req.user.id,
      login: req.user.login,
      role: req.user.role,
    };
  }
}
