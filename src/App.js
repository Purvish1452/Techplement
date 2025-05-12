import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/quote');
      if (response.data) {
        setQuote(response.data);
        setError(null);
      } else {
        setError('No quote available. Please try again.');
      }
    } catch (err) {
      setError('Failed to fetch quote. Please try again.');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchAuthor.trim()) return;

    try {
      setIsSearching(true);
      const response = await axios.get(`http://localhost:5000/api/quotes/search?author=${encodeURIComponent(searchAuthor)}`);
      setSearchResults(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search quotes');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>Quote of the Day</h1>
        
        {/* Search Form */}
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              placeholder="Search by author name..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </form>
        </div>

        {/* Random Quote */}
        <div className="quote-container">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : quote ? (
            <>
              <p className="quote-text">"{quote.text}"</p>
              <p className="quote-author">- {quote.author}</p>
            </>
          ) : (
            <p className="error">No quote available</p>
          )}
          <button onClick={fetchQuote} className="new-quote-btn">
            New Quote
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            <h2>Quotes by {searchAuthor}</h2>
            {searchResults.map((result, index) => (
              <div key={index} className="quote-container">
                <p className="quote-text">"{result.text}"</p>
                <p className="quote-author">- {result.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
