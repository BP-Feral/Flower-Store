import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/")
    .then((res) => res.join())
    .then((data) => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1>🌼 Flower Store</h1>
      <p>{message}</p>
    </div>
  )
}

export default App
