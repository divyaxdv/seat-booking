import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [seats, setSeats] = useState([]);
  const [numberOfSeats, setNumberOfSeats] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    const response = await fetch('http://localhost:8000/seats');
    const data = await response.json();
    setSeats(data);
  };

  const bookSeats = async () => {
    try {
      const response = await fetch('http://localhost:8000/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberOfSeats }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Booking successful! Your seats: ${data.bookedSeats.map(s => s.id).join(', ')}`);
        fetchSeats();
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('Error booking seats.');
    }
  };

  return (
    <div className="App">
      <h1>Train Seat Booking</h1>
      <div>
        <label>Number of seats to book (1-7): </label>
        <input
          type="number"
          min="1"
          max="7"
          value={numberOfSeats}
          onChange={(e) => setNumberOfSeats(Number(e.target.value))}
        />
        <button onClick={bookSeats}>Book Seats</button>
      </div>
      <p>{message}</p>
      <div className="seats-container">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`seat ${seat.status ? 'booked' : 'available'}`}
          >
            {seat.id}
          </div>
        ))}
      </div>
    </div>
    );
  }
  
  export default App;