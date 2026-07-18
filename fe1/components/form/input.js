import { useState } from 'react';

export default function Input({ type, name, placeholder, onChange, value }) {
  function handleChange(event) {
    const { value } = event.target;
    onChange(value);
  }

  return (
    <>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
      />

      <style jsx>{`
        input {
          width: 100%;
          font-size: 15px;
          margin-bottom: 24px;
          color: var(--text-main);
          font-weight: 500;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-sm);
          background-color: var(--surface);
          box-shadow: var(--shadow-sm);
          padding: 14px 20px;
          box-sizing: border-box;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        input:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        input::placeholder {
          color: var(--text-muted);
          font-weight: 400;
        }
        @media (max-width: 1000px) {
          input {
            width: 100%;
            align-self: center;
          }
        }
      `}</style>
    </>
  );
}
