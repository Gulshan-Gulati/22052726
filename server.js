import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = 9876;
const WINDOW_SIZE = 10;
const API_TIMEOUT = 500;
const BASE_URL = 'http://20.244.56.144/evaluation-service';

// Enable CORS
app.use(cors());
app.use(express.json());

// Store for numbers
let numberStore = [];

// Fallback test data
const fallbackData = {
  primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
  fibo: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
  even: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  rand: [4, 7, 12, 15, 18, 22, 25, 28, 31, 35]
};

// API endpoints mapping
const endpoints = {
  'p': { url: 'primes', fallback: fallbackData.primes },
  'f': { url: 'fibo', fallback: fallbackData.fibo },
  'e': { url: 'even', fallback: fallbackData.even },
  'r': { url: 'rand', fallback: fallbackData.rand }
};

// Fetch numbers with timeout
async function fetchNumbersWithTimeout(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      signal: controller.signal
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.numbers || [];
  } catch (error) {
    console.error(`Error fetching numbers: ${error.message}`);
    // Return fallback data if API fails
    return endpoints[endpoint].fallback || [];
  } finally {
    clearTimeout(timeout);
  }
}

// Calculate average of numbers
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / numbers.length).toFixed(2));
}

// Update number store
function updateNumberStore(newNumbers) {
  const prevState = [...numberStore];
  
  // Add new unique numbers
  for (const num of newNumbers) {
    if (!numberStore.includes(num)) {
      if (numberStore.length >= WINDOW_SIZE) {
        numberStore.shift(); // Remove oldest number
      }
      numberStore.push(num);
    }
  }

  return prevState;
}

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Average Calculator API',
    usage: {
      endpoints: {
        '/numbers/p': 'Get prime numbers',
        '/numbers/f': 'Get fibonacci numbers',
        '/numbers/e': 'Get even numbers',
        '/numbers/r': 'Get random numbers'
      }
    }
  });
});

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  
  if (!endpoints[numberid]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  try {
    const numbers = await fetchNumbersWithTimeout(endpoints[numberid].url);
    const windowPrevState = updateNumberStore(numbers);

    const response = {
      windowPrevState,
      windowCurrState: [...numberStore],
      numbers,
      avg: calculateAverage(numberStore)
    };

    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Add 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`Average Calculator service running on port ${port}`);
});