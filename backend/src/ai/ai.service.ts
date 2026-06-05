import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY is not set. AI Agent will run in mock mode.');
    }
  }

  async processQuery(companyId: string, userId: string, message: string) {
    // Basic context gathering
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    
    // Fallback Mock Response
    if (!this.openai) {
      return {
        reply: `Hello! I am the EVENTO AI Assistant for ${company?.name || 'your company'}. I'm currently running in mock mode. You said: "${message}". Please configure your OPENAI_API_KEY to enable full capabilities.`,
      };
    }

    // Actual OpenAI Integration
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are a helpful operational assistant for ${company?.name}. You manage events, vendors, and clients. Keep your answers concise and professional.` },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 250,
      });

      return {
        reply: response.choices[0]?.message?.content || 'I could not generate a response.',
      };
    } catch (error) {
      this.logger.error('OpenAI Error', error);
      return {
        reply: 'Sorry, I encountered an error communicating with the AI service.',
      };
    }
  }
}
