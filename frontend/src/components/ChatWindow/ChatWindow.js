import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getChatMessages, sendMessage, markMessagesRead } from '../../api/chatAPI';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = ({ taskId, otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { pusher } = useSocket();
  const { user } = useAuth();
  // track temp IDs so we don't duplicate when Pusher fires
  const pendingIds = useRef(new Set());

  useEffect(() => {
    if (!taskId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getChatMessages(taskId);
        setMessages(data.data || []);
        const unread = (data.data || []).filter(
          (msg) => (msg.receiver?._id || msg.receiver) === user._id && !msg.read
        );
        if (unread.length > 0) await markMessagesRead(taskId);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pusher || !taskId) return;

    const channel = pusher.subscribe(`task-${taskId}`);

    channel.bind('new-message', (message) => {
      const senderId = message.sender?._id || message.sender;
      // if this is our own message coming back from Pusher, replace the temp one
      if (senderId === user._id) {
        if (pendingIds.current.has(message._id?.toString())) return;
        setMessages((prev) => {
          // remove the optimistic temp message (has numeric _id) and add real one
          const withoutTemp = prev.filter((m) => typeof m._id !== 'number');
          return [...withoutTemp, message];
        });
      } else {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      pusher.unsubscribe(`task-${taskId}`);
    };
  }, [pusher, taskId, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const tempId = Date.now();
    const tempMessage = {
      _id: tempId,
      sender: user._id,
      receiver: otherUser._id,
      message: newMessage.trim(),
      createdAt: new Date(),
      task: taskId,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const res = await sendMessage(taskId, otherUser._id, tempMessage.message);
      const saved = res.data;
      pendingIds.current.add(saved._id?.toString());
      setMessages((prev) => prev.map((m) => (m._id === tempId ? saved : m)));
    } catch (error) {
      console.error('Failed to send message:', error.response?.data || error.message);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 py-8">
      <div className="w-full max-w-2xl h-[600px] rounded-2xl border shadow-2xl flex flex-col" style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {otherUser?.profileImage ? (
              <img src={otherUser.profileImage} alt={otherUser.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-sm">
                {otherUser?.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-gray-900">{otherUser?.name || 'User'}</h3>
              <p className="text-xs text-gray-500">Chat about this job</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl" aria-label="Close chat">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: 'var(--card-bg)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => {
              const senderId = msg.sender?._id || msg.sender;
              const isMe = senderId === user._id;
              return (
                <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm border border-gray-300'}`}
                    style={{ background: isMe ? '#16a34a' : '#e5e7eb', color: isMe ? '#ffffff' : '#000000' }}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/70 text-right' : 'text-gray-500'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="px-5 py-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`rounded-lg px-6 py-2 text-sm font-semibold text-white transition-colors ${!newMessage.trim() || sending ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
