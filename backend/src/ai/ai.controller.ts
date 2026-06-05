import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@CurrentUser() user: any, @Body('message') message: string) {
    if (!message) {
      return { reply: 'Please provide a message.' };
    }
    return this.aiService.processQuery(user.companyId, user.id, message);
  }
}
