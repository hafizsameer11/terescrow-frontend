import ConnectingScreen from '@/components/ConnectingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/themeContext';
import { COLORS, images } from '@/constants';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import CustomCancelTrade from '@/components/CustomCancelTrade';
import { useEffect, useState } from 'react';
import { useSocket } from '@/contexts/socketContext';
import { useNavigation } from 'expo-router';
import { NavigationProp, useRoute } from '@react-navigation/native';
const ConnnectingAgent = () => {
  const { dark } = useTheme();
  const { navigate, goBack } = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const {
    departmentId,
    categoryId,
    subCategoryId,
  }: { departmentId: string; categoryId: string; subCategoryId: string } =
    route.params as any;
  if (!departmentId || !categoryId || !subCategoryId) {
    return goBack();
  }
  const { connectToSocket, socket } = useSocket();
  const [isConnectingToSocket, setIsConnectingToSocket] = useState(true);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);

  useEffect(() => {
    if (!socket) {
      connectToSocket(departmentId, categoryId, subCategoryId);
    }
    if (socket) {
      if (isConnectingToSocket) {
        setIsConnectingToSocket(false);
        setIsWaitingForAgent(true);
      }
      socket.on('agentAssigned', (chatId: string) => {
        setIsWaitingForAgent(false);
        navigate('chatwithagent', { chatId: chatId.toString() });
      });
      socket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
        setIsConnectingToSocket(true);
        setIsWaitingForAgent(false);
        goBack();
      });
    }
  }, [socket]);
  // router.push('/chatwithagent');
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <View style={styles.container}>
        <Image
          source={images.connectingAgentBg}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.loadingTextContainer}>
          <Text style={styles.textContent1}>
            {isConnectingToSocket
              ? 'Connecting to Server'
              : isWaitingForAgent
              ? 'Connecting you to an agent'
              : 'Connected to an agent'}
          </Text>
          <Text style={styles.textContent2}>.. This will take few seconds</Text>
        </View>
        <CustomCancelTrade />
      </View>
    </SafeAreaView>
  );
};

export default ConnnectingAgent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  loadingTextContainer: {
    position: 'absolute',
  },
  textContent1: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  textContent2: {
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.white,
  },
});
