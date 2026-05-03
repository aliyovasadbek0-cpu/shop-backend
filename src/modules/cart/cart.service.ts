import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../../entities/cart-item.entity';
import { Product } from '../../entities/product.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  private normalizeSession(
    bodySession: string | undefined,
    headerSession: string | undefined,
  ): { sessionId: string; isNew: boolean } {
    const raw = bodySession?.trim() || headerSession?.trim();
    if (raw) return { sessionId: raw, isNew: false };
    return { sessionId: randomUUID(), isNew: true };
  }

  async add(
    dto: AddCartItemDto,
    headerSession?: string,
  ): Promise<{ sessionId: string; sessionIsNew: boolean; item: CartItem }> {
    const { sessionId, isNew } = this.normalizeSession(
      dto.sessionId,
      headerSession,
    );
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const size = dto.selectedSize.trim();
    const color = dto.selectedColor.trim();

    const existing = await this.cartRepo.findOne({
      where: {
        sessionId,
        productId: dto.productId,
        selectedSize: size,
        selectedColor: color,
      },
    });

    if (existing) {
      existing.quantity += dto.quantity;
      const item = await this.cartRepo.save(existing);
      return { sessionId, sessionIsNew: isNew, item };
    }

    const row = this.cartRepo.create({
      sessionId,
      productId: dto.productId,
      quantity: dto.quantity,
      selectedSize: size,
      selectedColor: color,
    });
    const item = await this.cartRepo.save(row);
    const full = await this.cartRepo.findOne({
      where: { id: item.id },
      relations: ['product'],
    });
    return { sessionId, sessionIsNew: isNew, item: full! };
  }

  async getSessionCart(sessionId: string) {
    if (!sessionId?.trim()) {
      throw new BadRequestException('sessionId (query yoki x-cart-session) kerak');
    }
    const items = await this.cartRepo.find({
      where: { sessionId: sessionId.trim() },
      relations: ['product'],
      order: { id: 'ASC' },
    });
    return { sessionId: sessionId.trim(), items };
  }

  async updateItem(
    sessionId: string,
    itemId: number,
    dto: UpdateCartItemDto,
  ) {
    if (!sessionId?.trim()) {
      throw new BadRequestException('sessionId kerak');
    }
    const item = await this.cartRepo.findOne({
      where: { id: itemId, sessionId: sessionId.trim() },
      relations: ['product'],
    });
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    return this.cartRepo.save(item);
  }

  async removeItem(sessionId: string, itemId: number) {
    if (!sessionId?.trim()) {
      throw new BadRequestException('sessionId kerak');
    }
    const item = await this.cartRepo.findOne({
      where: { id: itemId, sessionId: sessionId.trim() },
    });
    if (!item) throw new NotFoundException('Cart item not found');
    await this.cartRepo.remove(item);
    return { deleted: true, id: itemId };
  }

  async clearSession(sessionId: string) {
    await this.cartRepo.delete({ sessionId });
  }

  async getItemsForCheckout(sessionId: string) {
    return this.cartRepo.find({
      where: { sessionId },
      relations: ['product'],
    });
  }
}
