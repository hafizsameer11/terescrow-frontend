import ConnectingScreen from "@/components/ConnectingScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { COLORS } from "@/constants";
const ConnnectingAgent = () => {
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
      <ConnectingScreen />
    </SafeAreaView>
  );
};

export default ConnnectingAgent;
