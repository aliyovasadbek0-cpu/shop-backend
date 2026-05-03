import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  create(@Body() dto: SubscribeEmailDto) {
    return this.newsletterService.subscribe(dto);
  }

  @Get()
  findAll() {
    return this.newsletterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsletterService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriberDto,
  ) {
    return this.newsletterService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.newsletterService.remove(id);
  }
}
