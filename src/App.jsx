import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('e');

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/numbers/${type}`);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedType);
  }, [selectedType]);

  const numberTypes = [
    { id: 'e', name: 'Even Numbers' },
    { id: 'p', name: 'Prime Numbers' },
    { id: 'f', name: 'Fibonacci Numbers' },
    { id: 'r', name: 'Random Numbers' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Average Calculator
        </h1>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            {numberTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-md ${
                  selectedType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center text-gray-600">Loading...</div>
          )}

          {error && (
            <div className="text-center text-red-600 mb-4">
              Error: {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Previous Window State</h2>
                <div className="flex flex-wrap gap-2">
                  {data.windowPrevState.map((num, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Current Window State</h2>
                <div className="flex flex-wrap gap-2">
                  {data.windowCurrState.map((num, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 px-3 py-1 rounded-full text-sm"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Numbers from API</h2>
                <div className="flex flex-wrap gap-2">
                  {data.numbers.map((num, index) => (
                    <span
                      key={index}
                      className="bg-green-100 px-3 py-1 rounded-full text-sm"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h2 className="text-lg font-semibold">Average</h2>
                <p className="text-3xl font-bold text-blue-600">{data.avg}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;