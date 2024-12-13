const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

// Initialize seat data
const seats = Array(80).fill().map((_, i) => ({
  id: i + 1,
  row: Math.floor(i / 7) + 1,
  seat: (i % 7) + 1,
  status: false, // false means available
  booking_id: null,
}));

// Endpoint to get seat status
app.get('/seats', (req, res) => {
  res.json(seats);
});

// Endpoint to book seats
app.post('/book', (req, res) => {
  const { numberOfSeats } = req.body;
  if (!numberOfSeats || numberOfSeats < 1 || numberOfSeats > 7) {
    return res.status(400).json({ error: 'Invalid number of seats requested. Must be between 1 and 7.' });
  }

  const bookingId = Date.now(); // Use timestamp as unique booking ID
  let bookedSeats = [];

  // Try to find seats in a single row
  for (let row = 1; row <= 12; row++) {
    const availableSeats = seats.filter(seat => seat.row === row && !seat.status);
    if (availableSeats.length >= numberOfSeats) {
      bookedSeats = availableSeats.slice(0, numberOfSeats);
      break;
    }
  }

  // If no single row has enough seats, find the closest available ones
  if (bookedSeats.length === 0) {
    bookedSeats = seats.filter(seat => !seat.status).slice(0, numberOfSeats);
  }

  if (bookedSeats.length < numberOfSeats) {
    return res.status(400).json({ error: 'Not enough seats available.' });
  }

  // Mark seats as booked
  bookedSeats.forEach(seat => {
    seat.status = true;
    seat.booking_id = bookingId;
  });
  res.json({ bookingId, bookedSeats });
});

// Endpoint to cancel a booking
app.delete('/cancel/:bookingId', (req, res) => {
  const { bookingId } = req.params;
  const canceledSeats = seats.filter(seat => seat.booking_id === parseInt(bookingId));

  if (canceledSeats.length === 0) {
    return res.status(404).json({ error: 'Booking ID not found.' });
  }

  canceledSeats.forEach(seat => {
    seat.status = false;
    seat.booking_id = null;
  });

  res.json({ message: 'Booking canceled successfully.', canceledSeats });
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});