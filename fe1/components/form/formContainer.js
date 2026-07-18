export default function FormContainer({ children }) {
  return (
    <>
      <div className="formContainer">{children}</div>

      <style jsx>{`
        .formContainer {
          min-height: calc(100vh - 200px);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
}
