import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AgentChat from "@/components/ChatAgent/AgentChat";
import ChatPfpNav from "@/components/ChatPfpNav";
import { COLORS, images } from "@/constants";
import { useTheme } from "@/contexts/themeContext";

const ChatWithAgent = () => {
  const { dark } = useTheme();
  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        dark
          ? { backgroundColor: COLORS.black }
          : { backgroundColor: COLORS.white },
      ]}
    >
      <View>
        <ChatPfpNav
          name="Obi Junior"
          status="Always Online"
          image={images.maskGroup}
        />
      </View>
      <View style={{ flex: 1 }}>
        <AgentChat />
      </View>
    </SafeAreaView>
  );
};

export default ChatWithAgent;
