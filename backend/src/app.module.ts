import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { CompanyModule } from './company/company.module';
import { EmployeesModule } from './employees/employees.module';
import { ClientsModule } from './clients/clients.module';
import { EventsModule } from './events/events.module';
import { QuotationsModule } from './quotations/quotations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AvailabilityModule } from './availability/availability.module';
import { VenuesModule } from './venues/venues.module';
import { CommunicationsModule } from './communications/communications.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    SuperAdminModule,
    CompanyModule,
    EmployeesModule,
    ClientsModule,
    EventsModule,
    QuotationsModule,
    InvoicesModule,
    AvailabilityModule,
    VenuesModule,
    CommunicationsModule,
    AiModule,
  ],
})
export class AppModule {}
