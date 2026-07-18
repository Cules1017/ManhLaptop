export default function Button({ type, title, disabled = false, ...rest }) {
  return (
    <>
      <button type={type} disabled={disabled} {...rest}>
        {title}
      </button>

      <style jsx>{`
        button {
          width: 100%;
          margin-top: 24px;
          background-color: var(--secondary);
          color: #ffffff;
          border: none;
          font-size: 16px;
          font-weight: 600;
          border-radius: var(--radius-sm);
          padding: 16px 24px;
          align-self: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        button:hover:not(:disabled) {
          background-color: #1d4ed8; /* darker blue */
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 1000px) {
          button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
