import { Prisma, PrismaClient } from '@prisma/client';

import { config } from '../config/environment.js';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient =>
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

export const prisma: PrismaClient = globalThis.prisma ?? createPrismaClient();

if (config.nodeEnv !== 'production') {
  globalThis.prisma = prisma;
}

export type {
  User,
  Booking,
  Service,
  AvailabilityRule,
  Payment,
  Notification,
  AuditLog,
  UserRole,
  BookingStatus,
  PaymentStatus,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '@prisma/client';

export { Prisma };

export default prisma;
