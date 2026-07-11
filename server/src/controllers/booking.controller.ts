import { Request, Response } from 'express';
import Booking from '../models/Booking';

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error fetching bookings' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message || 'Error creating booking' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }
    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message || 'Error updating booking' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }
    res.status(200).json({ status: 'success', message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error deleting booking' });
  }
};
