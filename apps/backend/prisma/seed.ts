import { PrismaClient, BookingStatus, PaymentStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number, hour = 10, minute = 0): Date {
  const date = new Date(Date.now() + days * MS_PER_DAY);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export async function main(): Promise<void> {
  // Order matters: dependents first because of FK constraints.
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilityRule.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const [adminPasswordHash, clientPasswordHash] = await Promise.all([
    bcrypt.hash('AdminPass123!', BCRYPT_ROUNDS),
    bcrypt.hash('ClientPass123!', BCRYPT_ROUNDS),
  ]);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@studio.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      name: 'Studio Admin',
      phone: '+15550000000',
    },
  });

  const client1 = await prisma.user.create({
    data: {
      email: 'client1@example.com',
      passwordHash: clientPasswordHash,
      role: UserRole.CLIENT,
      name: 'Client One',
      phone: '+15550000001',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'client2@example.com',
      passwordHash: clientPasswordHash,
      role: UserRole.CLIENT,
      name: 'Client Two',
      phone: '+15550000002',
    },
  });

  const photographyService = await prisma.service.create({
    data: {
      name: 'Photography Session',
      description: 'A 60-minute professional photography session in the studio.',
      durationMinutes: 60,
      price: '100.00',
      active: true,
    },
  });

  const videoService = await prisma.service.create({
    data: {
      name: 'Video Session',
      description: 'A 120-minute professional video production session.',
      durationMinutes: 120,
      price: '200.00',
      active: true,
    },
  });

  // Availability rules: Monday (1) through Friday (5), 09:00-17:00.
  const availabilityRules = await Promise.all(
    [1, 2, 3, 4, 5].map((dayOfWeek) =>
      prisma.availabilityRule.create({
        data: {
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
      }),
    ),
  );

  const tomorrowStart = daysFromNow(1, 10, 0);
  const nextWeekStart = daysFromNow(7, 14, 0);
  const lastWeekStart = daysFromNow(-7, 11, 0);

  const confirmedBooking = await prisma.booking.create({
    data: {
      userId: client1.id,
      serviceId: photographyService.id,
      startTime: tomorrowStart,
      endTime: addMinutes(tomorrowStart, photographyService.durationMinutes),
      status: BookingStatus.CONFIRMED,
      notes: 'Portrait session — natural light preferred.',
    },
  });

  const pendingBooking = await prisma.booking.create({
    data: {
      userId: client2.id,
      serviceId: videoService.id,
      startTime: nextWeekStart,
      endTime: addMinutes(nextWeekStart, videoService.durationMinutes),
      status: BookingStatus.PENDING,
      notes: 'Product demo shoot.',
    },
  });

  const completedBooking = await prisma.booking.create({
    data: {
      userId: client1.id,
      serviceId: photographyService.id,
      startTime: lastWeekStart,
      endTime: addMinutes(lastWeekStart, photographyService.durationMinutes),
      status: BookingStatus.COMPLETED,
      notes: 'Family portraits — completed.',
    },
  });

  const confirmedPayment = await prisma.payment.create({
    data: {
      bookingId: confirmedBooking.id,
      amount: photographyService.price,
      status: PaymentStatus.COMPLETED,
      stripePaymentId: 'seed_pi_confirmed',
    },
  });

  const pendingPayment = await prisma.payment.create({
    data: {
      bookingId: pendingBooking.id,
      amount: videoService.price,
      status: PaymentStatus.PENDING,
    },
  });

  const completedPayment = await prisma.payment.create({
    data: {
      bookingId: completedBooking.id,
      amount: photographyService.price,
      status: PaymentStatus.COMPLETED,
      stripePaymentId: 'seed_pi_completed',
    },
  });

  await Promise.all(
    [
      { booking: confirmedBooking, payment: confirmedPayment },
      { booking: pendingBooking, payment: pendingPayment },
      { booking: completedBooking, payment: completedPayment },
    ].map(({ booking, payment }) =>
      prisma.booking.update({
        where: { id: booking.id },
        data: { paymentId: payment.id },
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log('Seed complete', {
    users: { admin: admin.email, client1: client1.email, client2: client2.email },
    services: [photographyService.name, videoService.name],
    availabilityRules: availabilityRules.length,
    bookings: {
      confirmed: confirmedBooking.id,
      pending: pendingBooking.id,
      completed: completedBooking.id,
    },
    payments: {
      confirmed: confirmedPayment.id,
      pending: pendingPayment.id,
      completed: completedPayment.id,
    },
  });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
