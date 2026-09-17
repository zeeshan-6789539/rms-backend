import type { leaseRentSchedules } from '../schema/lease-rent-schedules.schema.js';

export type ILeaseRentScheduleRow = typeof leaseRentSchedules.$inferSelect;
export type INewLeaseRentScheduleRow = typeof leaseRentSchedules.$inferInsert;
