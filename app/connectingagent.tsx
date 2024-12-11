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
  const { onlineAgents, socket, connectToSocket, requestAgentConnection } =
    useSocket();
  const [isConnectingToSocket, setIsConnectingToSocket] = useState(true);
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false);
  const [isContinuingPrevChat, setIsContinuingPrevChat] = useState(false);

  useEffect(() => {
    if (!socket) {
      connectToSocket();
    }
    if (socket) {
      requestAgentConnection(departmentId, categoryId, subCategoryId);

      socket.on('agentAssigned', (chatId: string) => {
        console.log('agent assigned');
        setIsWaitingForAgent(false);
        navigate('chatwithagent', { chatId: chatId.toString() });
      });

      socket.on('alreadyPendingChat', (chatId: string) => {
        setIsContinuingPrevChat(true);

        setTimeout(() => {
          navigate('chatwithagent', { chatId: chatId.toString() });
        }, 2000);
      });
    }

    return () => {
      if (socket) {
        socket.off('agentAssigned');
        socket.off('alreadyPendingChat');
      }
    };
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
              : isContinuingPrevChat
              ? 'Continuing your previous chat'
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
