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
          <FaSearch color="#999" size="16px" />
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
                    background: '#fafafa',
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
          padding: 0 8px 0 12px;
          height: 42px;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          box-sizing: border-box;
          border-radius: 6px;
        }
        .search-box:focus-within {
          border-color: #e53935;
        }
        .search-box .search-button {
          display: flex;
          align-items: center;
          background: none;
          border: none;
          height: 100%;
          cursor: pointer;
        }
        .search-box .search-button:focus {
          outline: none;
        }
        .search-box input {
          flex: 1;
          height: 100%;
          border: none;
          padding: 0 8px;
          font-size: 14px;
        }
        .search-box input:focus {
          outline: none;
        }
        .search-box select {
          height: 100%;
          max-width: 140px;
          font-size: 12px;
          color: #666;
          border: none;
          border-left: 1px solid #eee;
          background: none;
          padding: 0 8px;
          cursor: pointer;
        }
        .search-box select:focus {
          outline: none;
        }
        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 6px;
          z-index: 100;
          list-style: none;
          padding: 6px 0;
          max-height: 340px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .suggestion-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background 0.15s;
        }
        .suggestion-item:hover {
          background: #f8f8f8;
        }
        .sugg-name {
          font-size: 14px;
          color: #333;
        }
      `}</style>
    </form>
  );
}
