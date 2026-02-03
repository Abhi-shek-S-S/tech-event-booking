import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Event from './event.model';

/**
 * TypeScript interface for Booking document
 * Extends Document to include Mongoose methods and properties
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking Schema definition with validation and constraints
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string): boolean {
          // RFC 5322 compliant email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to verify that the referenced event exists
 * Throws an error if the event is not found in the database
 */
bookingSchema.pre('save', async function () {
  // Only validate eventId if it's new or modified
  if (this.isModified('eventId')) {
    try {
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        throw new Error(
          `Event with ID ${this.eventId} does not exist. Cannot create booking.`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to validate event reference: ${(error as Error).message}`
      );
    }
  }
});

// Create index on eventId for optimized queries (e.g., finding all bookings for an event)
bookingSchema.index({ eventId: 1 });

/**
 * Booking model or retrieve existing model to prevent OverwriteModelError
 * in Next.js development with hot reloading
 */
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
