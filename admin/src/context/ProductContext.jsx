import React, { useState, createContext } from 'react';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // The automatic fetching useEffect has been removed to prevent redundant API calls.
  // Components that need this data will be responsible for fetching it.

  return (
    <ProductContext.Provider value={{ products, setProducts, loading, setLoading, error, setError }}>
      {children}
    </ProductContext.Provider>
  );
};
