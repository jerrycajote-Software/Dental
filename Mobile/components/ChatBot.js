import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import Markdown from 'react-native-markdown-display';
import api from '../services/api';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I am your Dental Assistant. How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const { width } = useWindowDimensions();

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: input });
      setMessages(prev => [...prev, { id: Date.now() + 1, text: response.data.reply, sender: 'bot' }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Sorry, I am having trouble connecting. Please try again later.', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const markdownStyles = {
    body: { color: '#333', fontSize: 14, lineHeight: 20 },
    heading1: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 12 },
    heading2: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 10 },
    heading3: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4, marginTop: 8 },
    paragraph: { marginBottom: 8, lineHeight: 20 },
    list_item: { marginBottom: 4, flexDirection: 'row', alignItems: 'flex-start' },
    bullet_list: { marginBottom: 8, paddingLeft: 8 },
    ordered_list: { marginBottom: 8, paddingLeft: 8 },
    strong: { fontWeight: 'bold', color: '#1e40af' },
    em: { fontStyle: 'italic' },
    link: { color: '#3b82f6', textDecorationLine: 'underline' },
    blockquote: { 
      backgroundColor: '#f1f5f9', 
      borderLeftColor: '#3b82f6', 
      borderLeftWidth: 4, 
      paddingLeft: 10, 
      paddingVertical: 5, 
      marginVertical: 8,
      fontStyle: 'italic'
    },
    code_inline: { 
      backgroundColor: '#f1f5f9', 
      color: '#3b82f6', 
      paddingHorizontal: 6, 
      paddingVertical: 2, 
      borderRadius: 4,
      fontFamily: 'Courier New'
    },
    code_block: { 
      backgroundColor: '#1e293b', 
      color: '#e2e8f0', 
      padding: 10, 
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: 'Courier New',
      fontSize: 12
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
            {msg.sender === 'user' ? (
              <Text style={styles.userText}>{msg.text}</Text>
            ) : (
              <Markdown style={markdownStyles}>{msg.text}</Markdown>
            )}
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.botBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={[styles.botText, { marginLeft: 8 }]}>Thinking...</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about dental health..."
          placeholderTextColor="#94a3b8"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
          onPress={sendMessage} 
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  chatArea: {
    flex: 1,
    padding: 15,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderTopRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: { 
    color: '#fff', 
    fontSize: 14, 
    lineHeight: 20 
  },
  botText: { 
    color: '#333', 
    fontSize: 14, 
    lineHeight: 20 
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 22,
    paddingHorizontal: 18,
    marginRight: 10,
    backgroundColor: '#f8fafc',
    fontSize: 14,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 22,
    paddingHorizontal: 24,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChatBot;
