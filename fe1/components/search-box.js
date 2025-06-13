import { useState, useEffect, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { productService } from '../services/productService';

export default function SearchBox() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response && response.data) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timeoutRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { search: value };
        if (selectedCategory) params.category = selectedCategory;
        const response = await productService.getProducts(params);
        let products = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            products = response.data.data;
          }
        }
        setSuggestions(products.slice(0, 8)); // chỉ lấy tối đa 8 gợi ý
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setLoading(false);
    }, 300);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    // Nếu đã có query thì search lại theo category mới
    if (query.trim()) {
      handleInputChange({ target: { value: query } });
    }
  };

  const handleSuggestionClick = (product) => {
    setQuery(product.name);
    setShowSuggestions(false);
    router.push(`/product/${product.id}`);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div style={{ position: 'relative', width: 350 }}>
      <div className="search-box">
        <button className="search-button" tabIndex={-1}>
          <FaSearch color="#D8D8D8" size="15px" />
        </button>
        <input
          id="search"
          type="text"
          name="search"
          placeholder="Search goods"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowSuggestions(true)}
          onBlur={handleBlur}
          autoComplete="off"
        />
        <select
          id="categories-search"
          name="categories-search"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="" defaultValue>
            Category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label || category.name}
            </option>
          ))}
        </select>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #eee',
            zIndex: 10,
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((product) => (
            <li
              key={product.id}
              onMouseDown={() => handleSuggestionClick(product)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  width={32}
                  height={32}
                  style={{ marginRight: 8, verticalAlign: 'middle', objectFit: 'cover', borderRadius: 4 }}
                />
              )}
              <span>{product.name}</span>
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .search-box {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding-left: 12px;
          padding-right: 12px;
          height: 42px;
          background: #ffffff;
          border: 2px solid #f5f5f5;
          box-sizing: border-box;
          border-radius: 4px;
        }
        .search-box .search-button {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          height: 100%;
        }
        .search-box .search-button:focus {
          outline: none;
        }
        .search-box .search-button:hover {
          opacity: 40%;
        }
        .search-box input {
          width: 75%;
          height: 100%;
          border: none;
          padding-left: 8px;
        }
        .search-box input:focus {
          outline: none;
        }
        .search-box select {
          align-self: flex-end;
          max-width: 120px;
          height: 100%;
          text-transform: uppercase;
          font-style: normal;
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 1px;
          color: #b2b2b2;
          border: none;
          background: none;
        }
        .search-box select:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
