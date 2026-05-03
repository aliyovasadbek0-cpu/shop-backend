import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderLine } from '../../entities/order-line.entity';
import { Product } from '../../entities/product.entity';
import { CartItem } from '../../entities/cart-item.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import {
  formatMoney,
  getEffectiveUnitPrice,
  parseMoney,
} from '../../common/utils/price.util';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly cartService: CartService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  private defaultDeliveryFee(): number {
    const raw = this.config.get<string>('DEFAULT_DELIVERY_FEE', '15');
    return parseMoney(raw);
  }

  private promoPercent(code: string | undefined): number {
    if (!code?.trim()) return 0;
    const key = `PROMO_${code.trim().toUpperCase()}_PERCENT`;
    const v = this.config.get<string>(key);
    if (v == null || v === '') return 0;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  async checkout(dto: CreateCheckoutDto) {
    const sessionId = dto.sessionId.trim();
    const cartItems = await this.cartService.getItemsForCheckout(sessionId);
    if (!cartItems.length) {
      throw new BadRequestException('Savat bo‘sh');
    }

    const deliveryFee =
      dto.deliveryFee != null && dto.deliveryFee >= 0
        ? dto.deliveryFee
        : this.defaultDeliveryFee();

    const promoPct = this.promoPercent(dto.promoCode);

    return this.dataSource.transaction(async (manager) => {
      let subtotal = 0;
      const lines: OrderLine[] = [];
      const salesDeltas: { productId: number; qty: number }[] = [];

      for (const ci of cartItems) {
        const product = ci.product;
        if (!product) {
          throw new BadRequestException('Savatdagi mahsulot topilmadi');
        }
        const unit = getEffectiveUnitPrice(product);
        const lineTotal = unit * ci.quantity;
        subtotal += lineTotal;
        salesDeltas.push({ productId: product.id, qty: ci.quantity });
        const line = manager.create(OrderLine, {
          product,
          productName: product.name,
          unitPrice: formatMoney(unit),
          quantity: ci.quantity,
          size: ci.selectedSize,
          color: ci.selectedColor,
        });
        lines.push(line);
      }

      const discountAmount =
        Math.round(((subtotal * promoPct) / 100) * 100) / 100;
      const afterDiscount = Math.max(0, subtotal - discountAmount);
      const total = Math.round((afterDiscount + deliveryFee) * 100) / 100;

      const order = manager.create(Order, {
        email: dto.email?.trim() || null,
        sessionId,
        status: OrderStatus.PENDING,
        subtotal: formatMoney(subtotal),
        discountAmount: formatMoney(discountAmount),
        deliveryFee: formatMoney(deliveryFee),
        total: formatMoney(total),
        promoCode: dto.promoCode?.trim() || null,
        lines,
      });

      const saved = await manager.save(Order, order);

      for (const d of salesDeltas) {
        await manager.increment(
          Product,
          { id: d.productId },
          'salesCount',
          d.qty,
        );
      }

      await manager.getRepository(CartItem).delete({ sessionId });

      return manager.getRepository(Order).findOne({
        where: { id: saved.id },
        relations: ['lines'],
      });
    });
  }

  findAll() {
    return this.orderRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['lines'],
    });
  }

  async findOne(id: number) {
    const row = await this.orderRepo.findOne({
      where: { id },
      relations: ['lines'],
    });
    if (!row) throw new NotFoundException('Order not found');
    return row;
  }

  async update(id: number, dto: UpdateOrderDto) {
    const row = await this.findOne(id);
    if (dto.status !== undefined) row.status = dto.status;
    if (dto.email !== undefined) row.email = dto.email;
    if (dto.promoCode !== undefined) row.promoCode = dto.promoCode;
    return this.orderRepo.save(row);
  }

  async remove(id: number) {
    const row = await this.findOne(id);
    await this.orderRepo.remove(row);
    return { deleted: true, id };
  }
}
