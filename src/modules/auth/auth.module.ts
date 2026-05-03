import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SuperAdminSeeder } from './super-admin.seeder';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const days = parseInt(config.get<string>('JWT_EXPIRES_DAYS', '7'), 10);
        const expiresIn = Number.isFinite(days) && days > 0 ? days * 86400 : 7 * 86400;
        return {
          secret: config.get<string>('JWT_SECRET', 'dev-secret-change-in-production'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, SuperAdminSeeder],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
