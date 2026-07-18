import { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, List, ListItem, ListItemText, TextField, Button, Paper } from '@mui/material';
import api from '../services/api';

export default function LiveChat() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    const intv = setInterval(fetchSessions, 5000);
    return () => clearInterval(intv);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/admin/live-chat/sessions');
      if (res.data.status) {
        setSessions(res.data.sessions);
      }
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let intv;
    if (activeSession) {
      fetchMessages();
      intv = setInterval(fetchMessages, 3000);
    }
    return () => clearInterval(intv);
  }, [activeSession]);

  const fetchMessages = async () => {
    if (!activeSession) return;
    try {
      const res = await api.get(`/admin/live-chat/sessions/${activeSession.id}/messages`);
      if (res.data.status) {
        setMessages(res.data.messages);
      }
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeSession) return;
    const msg = input;
    setInput('');
    try {
      await api.post(`/admin/live-chat/sessions/${activeSession.id}/messages`, { message: msg });
      fetchMessages();
    } catch(e) {
      console.error(e);
    }
  };

  const handleClose = async () => {
    if (!activeSession) return;
    try {
      await api.post(`/admin/live-chat/sessions/${activeSession.id}/close`);
      setActiveSession(null);
      fetchSessions();
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4 }}>Tổng đài Live Chat</Typography>
        <Paper sx={{ display: 'flex', height: '70vh', overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
            <List disablePadding>
              {sessions.map(s => (
                <ListItem 
                  button 
                  divider
                  key={s.id} 
                  selected={activeSession?.id === s.id}
                  onClick={() => setActiveSession(s)}
                  sx={{ py: 2 }}
                >
                  <ListItemText 
                    primary={`Khách hàng #${s.guest_id.slice(-4)}`} 
                    secondary={
                      <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.messages?.[0]?.message || 'Đang chờ...'}
                      </span>
                    } 
                  />
                </ListItem>
              ))}
              {sessions.length === 0 && <Typography sx={{p: 2}} color="text.secondary">Không có yêu cầu chat nào.</Typography>}
            </List>
          </Box>
          {/* Chat Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa' }}>
            {activeSession ? (
              <>
                <Box sx={{ p: 2, backgroundColor: '#fff', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Đang chat với: #{activeSession.guest_id.slice(-4)}</Typography>
                  <Button variant="outlined" color="error" onClick={handleClose}>Kết thúc phiên</Button>
                </Box>
                <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
                  {messages.map(m => (
                    <Box key={m.id} sx={{ mb: 2, display: 'flex', justifyContent: m.sender_type === 'admin' ? 'flex-end' : 'flex-start' }}>
                      <Box sx={{ 
                        p: 2, 
                        maxWidth: '70%', 
                        borderRadius: 2,
                        backgroundColor: m.sender_type === 'admin' ? '#1976d2' : '#fff', 
                        color: m.sender_type === 'admin' ? '#fff' : '#000',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        border: m.sender_type === 'user' ? '1px solid #eee' : 'none'
                      }}>
                        <div dangerouslySetInnerHTML={{ __html: m.message }} />
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
                <Box component="form" onSubmit={handleSend} sx={{ p: 2, backgroundColor: '#fff', borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Nhập tin nhắn phản hồi..." 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    autoComplete="off"
                  />
                  <Button type="submit" variant="contained" disabled={!input.trim()}>Gửi</Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Typography color="text.secondary">Chọn một phiên chat bên trái để bắt đầu hỗ trợ</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
