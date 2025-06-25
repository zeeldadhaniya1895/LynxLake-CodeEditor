import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

//Hooks
import useAPI from '../hooks/api';
import { useUser } from '../context/user';

//Utils
import { getAvatar } from '../utils/avatar';
import { formatLogTimestamp } from "../utils/formatters";

//Material Components
import { Box, Avatar, CircularProgress, Typography, IconButton } from '@mui/material';

//Material Icons
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';

import logo from '../images/logo.jpg';

function Chat(props) {

    const { socket, projectId } = props;
    const { GET } = useAPI();
    const { userInfo } = useUser();

    const [isEmojiOn, setIsEmojiOn] = useState(false);
    const [message, setMessage] = useState('');
    const [showScrollUp, setShowScrollUp] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(true);
    const chatContainerRef = useRef(null);
    const textareaRef = useRef(null);

    const [isChatLoading, setIsChatLoading] = useState(false);
    const [msgSendLoading, setMsgSendLoading] = useState(false);
    const [messages, setMessages] = useState([]);

    const GEMINI_API_KEY = "AIzaSyB_wgDMWnrlTvlF3unpJc8w7weeY5RXRTc";

    const toggleEmoji = () => setIsEmojiOn((prev) => !prev);

    // Function to scroll to top
    const scrollToTop = () => {
        chatContainerRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Function to scroll to bottom
    const scrollToBottom = () => {
        chatContainerRef.current?.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth',
        });
    };

    // Function to handle scroll event
    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

        // Show or hide the scroll icons based on the current scroll position
        setShowScrollUp(scrollTop > 0);
        setShowScrollDown(scrollTop + clientHeight < scrollHeight);
    };

    // Attach scroll event listener
    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (chatContainer) {
            chatContainer.addEventListener('scroll', handleScroll);
        }
        // Cleanup listener on component unmount
        return () => {
            if (chatContainer) {
                chatContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    // Focus on the input field when the component renders
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const loadMessages = async () => {
            setIsChatLoading(true);
            try {
                const response = await GET(`/api/project/${projectId}/chat/messages`);
                setMessages(response.data);
                scrollToBottom();
            } catch (error) {
                toast(error.response?.data?.message || "Failed to load messages",
                    {
                        icon: <CancelRoundedIcon />,
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    }
                );
            } finally {
                setIsChatLoading(false);
            }
        }
        if (projectId) loadMessages();
    }, [projectId]);

    // AI response fetcher
    async function fetchAIResponse(userMsg) {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { parts: [ { text: `You are a helpful AI assistant for coding and technical queries. Only answer coding, programming, or technical questions.\nUser: ${userMsg}` } ] }
                ]
            })
        });
        const data = await res.json();
        // Gemini API returns: data.candidates[0].content.parts[0].text
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "(AI couldn't answer)";
    }

    const handleSubmit = async () => {
        if (!socket || message.trim() === '') return;

        setMsgSendLoading(true);
        const msgTime = new Date().toISOString();

        // Emit user message
        socket.emit('chat:send-message', { message, time: msgTime });
        setMessage('');

        // If @ai mention che to Gemini call karo
        if (message.trim().toLowerCase().includes('@ai')) {
            const aiText = await fetchAIResponse(message);
            // Emit AI message as if from AI
            socket.emit('chat:send-message', {
                message: aiText,
                time: new Date().toISOString(),
                username: 'AI',
                isAI: true,
                image: ''
            });
        }
    }

    useEffect(() => {
        if (!socket) return;

        const handleMessages = (data) => {
            const { socketId, ...other } = data;

            if (socketId === socket.id) { setMsgSendLoading(false); }

            setMessages((prevMessages) => [...prevMessages, other])
        }

        socket.on('chat:receive-message', handleMessages);

        return () => {
            socket.off('chat:receive-message', handleMessages);
        }
    }, [socket]);


    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                bgcolor: '#181c23',
                borderRadius: 3,
                boxShadow: '0 2px 16px #0004',
            }}
        >
            {/* Chat Heading */}
            <Box sx={{ px: 3, pt: 2, pb: 1, borderBottom: '1.5px solid #23272f', bgcolor: 'transparent', zIndex: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#58A6FF', letterSpacing: 1, fontSize: '1.2rem', mb: 0.2 }}>
                    Project Chat
                </Typography>
                <Typography variant="body2" sx={{ color: '#A0B3D6', fontSize: '0.98rem', fontWeight: 500 }}>
                    Collaborate with your team. Mention <b>@ai</b> for instant help!
                </Typography>
            </Box>
            {/* Messages Section */}
            <Box
                id="style-1"
                ref={chatContainerRef}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 2,
                    minHeight: '24vh',
                    maxHeight: 'calc(100vh - 180px)',
                    bgcolor: 'transparent',
                }}
            >
                {isChatLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
                        <CircularProgress size={24} thickness={6} sx={{ color: "#58A6FF" }} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', position: 'relative', zIndex: 2 }}>
                        <Box sx={{ p: 3, borderRadius: 5, bgcolor: '#23272f', boxShadow: '0 8px 32px #0008, 0 0 0 2px #58A6FF44', border: '1.5px solid #23272f', minWidth: 280, maxWidth: 400, backdropFilter: 'blur(12px)', textAlign: 'center', mb: 2 }}>
                            <img src={logo} alt="Chat Logo" style={{ width: 56, height: 56, borderRadius: '50%', marginBottom: 12, boxShadow: '0 2px 12px #58A6FF44', background: '#161B22', border: '2px solid #58A6FF' }} />
                            <Typography variant="h6" sx={{ background: 'linear-gradient(90deg, #58A6FF 30%, #1F6FEB 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900, mb: 1, letterSpacing: 1, fontSize: '1.4rem', textShadow: '0 2px 12px #58A6FF22' }}>
                                Welcome to Project Chat!
                            </Typography>
                            <Typography sx={{ color: '#A0B3D6', mb: 1 }}>No messages yet.</Typography>
                            <Typography sx={{ color: '#58A6FF', fontWeight: 700, fontSize: '1.1rem', mb: 1 }}>Say hi to your teammates! 👋</Typography>
                            <Typography sx={{ color: '#A0B3D6', fontSize: '1rem', fontStyle: 'italic', mb: 2 }}>
                                "Every great project starts with a hello! 💬"
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    messages.map((msg, index) => {
                        const isAI = msg.username === 'AI' || msg.isAI;
                        // AI message kabhi bhi apnu na hoy, always left/center
                        const isMe = !isAI && msg.username === userInfo?.userName;
                        return (
                            <Box key={index} sx={{
                                display: 'flex',
                                justifyContent: isAI ? 'center' : isMe ? 'flex-end' : 'flex-start',
                                gap: 1.5,
                                my: '10px',
                                alignItems: 'flex-end',
                            }}>
                                {/* Left Avatar (other user) */}
                                {!isMe && !isAI && (
                                    <Avatar sx={{ width: 36, height: 36, fontSize: 16, border: "1.5px solid #58A6FF" }} alt={msg.username} src={getAvatar(msg.image)} />
                                )}
                                {/* AI Avatar */}
                                {isAI && (
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#bdbdbd', color: 'white', fontWeight: 900, fontSize: 20, border: '2px solid #fff', boxShadow: '0 2px 8px #8e24aa44' }}>
                                        <SmartToyRoundedIcon />
                                    </Avatar>
                                )}
                                {/* Chat Bubble */}
                                <Box sx={{
                                    py: 1.2,
                                    px: 2.2,
                                    borderRadius: 3.5,
                                    bgcolor: isAI ? '#e0e0e0' : isMe ? '#58A6FF' : '#F5F7FA',
                                    color: isAI ? '#23272f' : isMe ? 'white' : '#23272f',
                                    maxWidth: '65%',
                                    minWidth: 60,
                                    boxShadow: isAI ? '0 2px 12px #bdbdbd33' : isMe ? '0 2px 8px #58A6FF22' : '0 2px 8px #23272f22',
                                    border: isAI ? '2px solid #bdbdbd' : isMe ? '2px solid #58A6FF' : '1.5px solid #E6E6E6',
                                    fontStyle: isAI ? 'italic' : 'normal',
                                    fontWeight: isAI ? 600 : 500,
                                    position: 'relative',
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                }}>
                                    <Typography variant="caption" fontWeight="bold" sx={{ color: isAI ? '#616161' : isMe ? '#E6EDF3' : '#404040', mb: 0.2 }}>{isAI ? 'AI' : msg.username}</Typography>
                                    <Typography sx={{ fontWeight: 'bold', color: isAI ? '#23272f' : isMe ? 'white' : 'black', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{msg.message}</Typography>
                                    <Box sx={{ width: "100%", display: "flex", justifyContent: isMe ? 'flex-end' : 'flex-start', px: 1 }}>
                                        <Typography variant="caption" fontWeight="bold" sx={{ color: isAI ? '#616161' : isMe ? '#E6EDF3' : 'grey' }}>{msg.time && formatLogTimestamp(msg.time)}</Typography>
                                    </Box>
                                </Box>
                                {/* Right Avatar (me) */}
                                {isMe && (
                                    <Avatar sx={{ width: 36, height: 36, fontSize: 16, border: "1.5px solid #58A6FF" }} alt={msg.username} src={getAvatar(userInfo?.image)} />
                                )}
                            </Box>
                        );
                    })
                )}
            </Box>
            {/* Input Section (Sticky) */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1.5px solid #23272f',
                    p: 1.5,
                    gap: 1.2,
                    bgcolor: '#23272f',
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <IconButton onClick={toggleEmoji} sx={{ color: '#58A6FF', bgcolor: '#F5F7FA', borderRadius: 2, '&:hover': { bgcolor: '#E6E6E6' } }}>
                        <SentimentSatisfiedRoundedIcon />
                    </IconButton>
                </Box>
                <textarea
                    id='style-1'
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message..."
                    rows={message.includes('\n') ? 2 : 1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (e.shiftKey) {
                                e.preventDefault();
                                setMessage((prevMsg) => prevMsg + '\n');
                            } else {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }
                    }}
                    style={{
                        flexGrow: 2,
                        backgroundColor: '#F5F7FA',
                        border: '1.5px solid #58A6FF',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        outline: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.08rem',
                        resize: 'none',
                        minHeight: 36,
                        maxHeight: 80,
                        boxShadow: '0 1px 4px #58A6FF11',
                        color: '#23272f',
                        transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                />
                <IconButton
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: '#58A6FF',
                        color: 'white',
                        borderRadius: 2,
                        ml: 1,
                        p: 1.2,
                        '&:hover': { backgroundColor: '#1F6FEB' },
                        boxShadow: '0 2px 8px #58A6FF33',
                    }}
                    disabled={msgSendLoading || !message.trim()}
                >
                    {msgSendLoading ? <CircularProgress size={20} thickness={6} sx={{ color: "white" }} /> : <SendRoundedIcon />}
                </IconButton>
            </Box>
            {/* Emoji Picker */}
            {isEmojiOn && (
                <Box sx={{ zIndex: 999999999, position: 'absolute', bottom: 60, left: 20 }}>
                    <EmojiPicker
                        onEmojiClick={(emojiData) => setMessage((prevMsg) => prevMsg + emojiData.emoji)}
                        emojiStyle="facebook"
                        theme={Theme.DARK}
                        style={{ display: 'flex', width: '100%', zIndex: 999999999 }}
                    />
                </Box>
            )}
        </Box>
    );
}

export default Chat;
