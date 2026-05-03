import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  add(
    @Body() dto: AddCartItemDto,
    @Headers('x-cart-session') headerSession?: string,
  ) {
    return this.cartService.add(dto, headerSession);
  }

  @Get()
  getCart(
    @Query('sessionId') sessionId: string | undefined,
    @Headers('x-cart-session') headerSession?: string,
  ) {
    const sid = sessionId?.trim() || headerSession?.trim() || '';
    return this.cartService.getSessionCart(sid);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCartItemDto,
    @Query('sessionId') sessionId: string | undefined,
    @Headers('x-cart-session') headerSession?: string,
  ) {
    const sid = sessionId?.trim() || headerSession?.trim() || '';
    return this.cartService.updateItem(sid, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('sessionId') sessionId: string | undefined,
    @Headers('x-cart-session') headerSession?: string,
  ) {
    const sid = sessionId?.trim() || headerSession?.trim() || '';
    return this.cartService.removeItem(sid, id);
  }
}
