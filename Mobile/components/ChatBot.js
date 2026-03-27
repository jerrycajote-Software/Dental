import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
      setInput('');
      // AI 
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatArea}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={msg.sender === 'user' ? styles.userText : styles.botText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
  },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatBot;
