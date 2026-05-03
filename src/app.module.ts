import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { StylesModule } from './modules/styles/styles.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'shop_co'),
        autoLoadEntities: true,
        synchronize: config.get<string>('TYPEORM_SYNC') === 'true',
      }),
    }),
    AuthModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    CartModule,
    OrdersModule,
    NewsletterModule,
    StylesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
