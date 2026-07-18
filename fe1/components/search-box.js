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
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const runSearchSuggest = (value, categoryId) => {
    clearTimeout(timeoutRef.current);
    if (!value || !value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      try {
        const params = { search: value };
        if (categoryId) params.category = categoryId;
        const response = await productService.getProducts(params);
        let products = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            products = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            products = response.data.data;
          }
        }
        setSuggestions(products.slice(0, 8));
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    runSearchSuggest(value, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (query.trim()) runSearchSuggest(query, value);
  };

  const handleSuggestionClick = (product) => {
    setQuery('');
    setShowSuggestions(false);
    router.push(`/product/${product.id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const q = query.trim();
    if (!q) return;
    const target = selectedCategory
      ? `/category/${selectedCategory}?search=${encodeURIComponent(q)}`
      : `/?search=${encodeURIComponent(q)}`;
    router.push(target);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <div className="search-box">
        <button className="search-button" type="submit" aria-label="Tìm kiếm">
          <FaSearch size="16px" />
        </button>
        <input
          id="search"
          type="text"
          name="search"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && suggestions.length && setShowSuggestions(true)}
          onBlur={handleBlur}
          autoComplete="off"
        />
        <select
          id="categories-search"
          name="categories-search"
          value={selectedCategory}
          onChange={handleCategoryChange}
          aria-label="Lọc theo danh mục"
        >
          <option value="">Tất cả</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label || category.name}
            </option>
          ))}
        </select>
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((product) => (
            <li
              key={product.id}
              onMouseDown={() => handleSuggestionClick(product)}
              className="suggestion-item"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  width={36}
                  height={36}
                  style={{
                    marginRight: 10,
                    objectFit: 'contain',
                    borderRadius: 4,
                    background: 'var(--surface-hover)',
                  }}
                />
              )}
              <span className="sugg-name">{product.name}</span>
            </li>
          ))}
        </ul>
      )}
      <style jsx>{`
        .search-box {
          display: flex;
          flex-direction: row;
          align-items: center;
          padding: 0 8px 0 16px;
          height: 48px;
          background: var(--surface);
          border: 1px solid var(--surface-border);
          box-sizing: border-box;
          border-radius: var(--radius-lg);
          transition: all var(--transition-smooth);
          box-shadow: 0 0 0 rgba(0, 0, 0, 0);
        }
        .search-box:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 15px var(--accent-glow);
        }
        .search-box .search-button {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          height: 100%;
          cursor: pointer;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }
        .search-box:focus-within .search-button, .search-box .search-button:hover {
          color: var(--accent);
        }
        .search-box input {
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          color: var(--text-main);
          padding: 0 12px;
          font-size: 15px;
        }
        .search-box input::placeholder {
          color: var(--text-muted);
        }
        .search-box input:focus {
          outline: none;
        }
        .search-box select {
          height: 100%;
          max-width: 140px;
          font-size: 13px;
          color: var(--text-main);
          border: none;
          border-left: 1px solid var(--surface-border);
          background: transparent;
          padding: 0 8px 0 12px;
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .search-box select option {
          background: var(--bg-color);
          color: var(--text-main);
        }
        .search-box select:focus {
          outline: none;
          color: var(--accent);
        }
        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 12px;
          background: var(--surface);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          z-index: 100;
          list-style: none;
          padding: 8px 0;
          max-height: 340px;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .suggestion-item {
          padding: 10px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background var(--transition-fast);
        }
        .suggestion-item:hover {
          background: var(--surface-hover);
        }
        .sugg-name {
          font-size: 14px;
          color: var(--text-main);
        }
      `}</style>
    </form>
  );
}
