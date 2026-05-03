import { Body, Controller, Post } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { SubscribeEmailDto } from './dto/subscribe-email.dto';

/** Figma footer: POST /api/subscribe */
@Controller('subscribe')
export class SubscribeController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  subscribe(@Body() dto: SubscribeEmailDto) {
    return this.newsletterService.subscribe(dto);
  }
}
