export default function Title({ title, level = 1 }) {
  const Tag = level === 2 ? 'h2' : level === 3 ? 'h3' : 'h1';
  return (
    <>
      <Tag className="page-title">{title}</Tag>
      <style jsx>{`
        .page-title {
          font-weight: 700;
          font-size: 32px;
          letter-spacing: 0.5px;
          color: #333;
          margin: 16px 0 24px;
          align-self: flex-start;
        }
        @media (max-width: 768px) {
          .page-title {
            font-size: 24px;
            margin: 12px 0 16px;
          }
        }
      `}</style>
    </>
  );
}
