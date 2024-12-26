import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatHeaderProps {
  recipientName?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ recipientName }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        {recipientName ? `Chat with ${recipientName}` : 'Chat'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});