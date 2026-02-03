/**
 * Database models central export
 * Import models from this file throughout the application for consistency
 */

export { default as Event } from './event.model';
export { default as Booking } from './booking.model';

// Export TypeScript interfaces for type checking
export type { IEvent } from './event.model';
export type { IBooking } from './booking.model';
