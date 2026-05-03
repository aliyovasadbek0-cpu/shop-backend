import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';
import { OrderLine } from '../../entities/order-line.entity';
import { CartModule } from '../cart/cart.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderLine]), CartModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
