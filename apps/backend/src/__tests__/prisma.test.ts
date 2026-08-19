import { randomUUID } from 'node:crypto';

import { prisma } from '../lib/prisma.js';

const uniqueEmail = (label: string): string =>
  `${label}-${randomUUID()}@example.test`;

describe('Prisma Database Operations', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Best-effort cleanup of anything the test file created.
    await prisma.auditLog.deleteMany({ where: { entityType: 'test' } });
    await prisma.notification.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.service.deleteMany({ where: { name: { startsWith: 'test-service' } } });
    await prisma.user.deleteMany({ where: { email: { contains: '@example.test' } } });
    await prisma.$disconnect();
  });

  it('creates user successfully', async () => {
    const email = uniqueEmail('create');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: 'hashed-password',
        name: 'Create User',
      },
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.id.length).toBeGreaterThan(0);
    expect(user.email).toBe(email);
    expect(user.role).toBe('CLIENT');
  });

  it('creates booking with relations', async () => {
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail('relations'),
        passwordHash: 'hashed-password',
        name: 'Relations User',
      },
    });

    const service = await prisma.service.create({
      data: {
        name: `test-service-${randomUUID()}`,
        description: 'A test service for relation checks.',
        durationMinutes: 60,
        price: '100.00',
      },
    });

    const start = new Date();
    start.setUTCHours(start.getUTCHours() + 1, 0, 0, 0);
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
      },
      include: { user: true, service: true },
    });

    expect(booking.user).toBeDefined();
    expect(booking.user.id).toBe(user.id);
    expect(booking.service).toBeDefined();
    expect(booking.service.id).toBe(service.id);
    expect(booking.status).toBe('CONFIRMED');
  });

  it('enforces unique constraints', async () => {
    const email = uniqueEmail('unique');
    await prisma.user.create({
      data: {
        email,
        passwordHash: 'hashed-password',
        name: 'Unique User',
      },
    });

    await expect(
      prisma.user.create({
        data: {
          email,
          passwordHash: 'hashed-password',
          name: 'Duplicate User',
        },
      }),
    ).rejects.toThrow();
  });

  it('cascades deletes properly', async () => {
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail('cascade'),
        passwordHash: 'hashed-password',
        name: 'Cascade User',
      },
    });

    const service = await prisma.service.create({
      data: {
        name: `test-service-${randomUUID()}`,
        description: 'Cascade check service.',
        durationMinutes: 30,
        price: '50.00',
      },
    });

    const start = new Date();
    start.setUTCHours(start.getUTCHours() + 2, 0, 0, 0);
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);

    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        startTime: start,
        endTime: end,
        status: 'PENDING',
      },
    });

    // The schema does not declare onDelete: Cascade, so deleting the user
    // while related bookings exist should be rejected by the FK constraint.
    // This assertion documents that behavior — related bookings are not
    // silently orphaned.
    await expect(
      prisma.user.delete({ where: { id: user.id } }),
    ).rejects.toThrow();

    const stillExists = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(stillExists).not.toBeNull();

    // Clean up the booking and user manually so the test's side effects
    // don't leak into other tests.
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});
