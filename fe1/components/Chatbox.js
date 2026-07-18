import { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Xin chào! Tôi là AI tư vấn viên của MANH STORE. Bạn cần hỗ trợ gì về laptop?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferred, setIsTransferred] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Polling for live chat messages
  useEffect(() => {
    let interval;
    if (isTransferred && liveSessionId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/live-chat/${liveSessionId}/messages`);
          const data = await res.json();
          if (data && data.status) {
            const formatted = data.messages.map(m => ({
              role: m.sender_type === 'user' ? 'user' : 'model',
              content: m.message
            }));
            setMessages(formatted);
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isTransferred, liveSessionId]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // If in live chat mode
    if (isTransferred && liveSessionId) {
      setIsLoading(true);
      try {
        await fetch(`http://127.0.0.1:8000/api/live-chat/${liveSessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage })
        });
        // Optimistic UI update
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Normal AI Chat Mode
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(1) // exclude first greeting
        })
      });

      const data = await res.json();

      if (data && data.status) {
        const finalMessages = [...newMessages, { role: 'model', content: data.message }];
        setMessages(finalMessages);

        if (data.transfer) {
          setIsTransferred(true);
          // Start live chat session and push history
          try {
            const startRes = await fetch('http://127.0.0.1:8000/api/live-chat/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ history: finalMessages })
            });
            const startData = await startRes.json();
            if (startData.status) {
              setLiveSessionId(startData.session_id);
            }
          } catch(err) { console.error('Failed to start live session', err); }
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: data?.message || 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: 'Xin lỗi, không thể kết nối tới máy chủ.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="chatbox-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
      </button>

      {isOpen && (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <h4>{isTransferred ? 'Tư vấn viên (Live Chat)' : 'AI Tư vấn - MANH STORE'}</h4>
            <button onClick={() => setIsOpen(false)}><FaTimes /></button>
          </div>
          
          <div className="chatbox-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbox-message ${msg.role}`}>
                <div 
                  className="bubble" 
                  dangerouslySetInnerHTML={msg.role === 'model' ? { __html: msg.content } : undefined}
                >
                  {msg.role === 'user' ? msg.content : null}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbox-message model">
                <div className="bubble typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbox-input" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder={isTransferred ? "Nhập tin nhắn cho nhân viên..." : "Nhập câu hỏi..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        .chatbox-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e53935;
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: transform 0.3s ease;
        }
        .chatbox-toggle:hover {
          transform: scale(1.05);
        }

        .chatbox-container {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 380px;
          height: 550px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
          border: 1px solid #eee;
        }

        .chatbox-header {
          background: #e53935;
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbox-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .chatbox-header button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        .chatbox-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f9f9f9;
        }

        .chatbox-message {
          display: flex;
          max-width: 85%;
        }
        .chatbox-message.user {
          align-self: flex-end;
        }
        .chatbox-message.model {
          align-self: flex-start;
        }

        .bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
          word-break: break-word;
        }
        .chatbox-message.user .bubble {
          background: #e53935;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .chatbox-message.model .bubble {
          background: #ffffff;
          color: #333;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }
        
        /* Make links inside bubble look like clickable buttons/options */
        .chatbox-message.model .bubble :global(a) {
          display: inline-block;
          background: rgba(229, 57, 53, 0.1);
          color: #e53935;
          padding: 6px 10px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          margin: 4px 0;
          border: 1px solid rgba(229, 57, 53, 0.2);
          transition: all 0.2s;
        }
        .chatbox-message.model .bubble :global(a:hover) {
          background: rgba(229, 57, 53, 0.2);
          transform: translateY(-1px);
        }
        .chatbox-message.model .bubble :global(ul) {
          padding-left: 20px;
          margin: 8px 0;
        }
        .chatbox-message.model .bubble :global(li) {
          margin-bottom: 6px;
        }

        /* Product Card Formatting from AI */
        .chatbox-message.model .bubble :global(.product-card) {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #eee;
          padding: 8px;
          border-radius: 8px;
          margin: 8px 0;
          background: #fafafa;
        }
        .chatbox-message.model .bubble :global(.product-card img) {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 4px;
          background: #fff;
        }
        .chatbox-message.model .bubble :global(.product-card-info) {
          display: flex;
          flex-direction: column;
        }
        .chatbox-message.model .bubble :global(.product-card-info a) {
          margin: 0;
          padding: 0;
          background: none;
          border: none;
          display: inline;
        }
        .chatbox-message.model .bubble :global(.product-card-info a:hover) {
          text-decoration: underline;
          transform: none;
        }
        .chatbox-message.model .bubble :global(.product-price) {
          color: #e53935;
          font-weight: bold;
          font-size: 13px;
        }

        .typing {
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }

        .chatbox-input {
          display: flex;
          padding: 12px;
          background: #fff;
          border-top: 1px solid #eee;
          gap: 8px;
        }
        .chatbox-input input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
        }
        .chatbox-input input:focus {
          border-color: #e53935;
        }
        .chatbox-input button {
          background: #e53935;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chatbox-input button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .chatbox-container {
            width: 100%;
            height: 100%;
            bottom: 0;
            right: 0;
            border-radius: 0;
          }
          .chatbox-toggle {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  );
}
