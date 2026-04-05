import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getChatMessages, markMessagesRead } from '../../api/chatAPI';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = ({ taskId, otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (taskId) {
      fetchMessages(); // eslint-disable-line react-hooks/exhaustive-deps
      joinChatRoom();  // eslint-disable-line react-hooks/exhaustive-deps
    }
  }, [taskId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      if (message.task === taskId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinChatRoom = () => {
    if (socket && taskId) {
      socket.emit('join_chat', { taskId });
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await getChatMessages(taskId);
      setMessages(data.data || []);
      
      const unreadMessages = data.data?.filter(
        (msg) => msg.receiver === user._id && !msg.read
      );
      if (unreadMessages?.length > 0) {
        await markMessagesRead(taskId);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || sending) return;

    const tempMessage = {
      _id: Date.now(),
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
      socket.emit('send_message', {
        taskId,
        sender: user._id,
        receiver: otherUser._id,
        message: tempMessage.message,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 py-8">
      <div className="w-full max-w-2xl h-[600px] rounded-2xl border shadow-2xl flex flex-col" style={{ background: 'var(--card-bg)', borderColor: '#000000' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {otherUser?.profileImage ? (
              <img
                src={otherUser.profileImage}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
            aria-label="Close chat"
          >
            ✕
          </button>
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
              const isMe = msg.sender === user._id || msg.sender?._id === user._id;
              return (
                <div
                  key={msg._id || index}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                      isMe
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm border border-gray-300'
                    }`}
                    style={{ background: isMe ? '#16a34a' : '#e5e7eb', color: isMe ? '#ffffff' : '#000000' }}
                  >
                    <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMe ? 'text-white/70 text-right' : 'text-gray-500'
                      }`}
                    >
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
              className={`rounded-lg px-6 py-2 text-sm font-semibold text-white transition-colors ${
                !newMessage.trim() || sending
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800'
              }`}
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
