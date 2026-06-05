import { Module } from '@nestjs/common';
import { CommunicationsService } from './communications.service';

@Module({
  providers: [CommunicationsService]
})
export class CommunicationsModule {}
