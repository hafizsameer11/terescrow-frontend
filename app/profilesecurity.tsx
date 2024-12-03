import { COLORS, icons } from "@/constants";
import { Image } from "expo-image";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/themeContext";
import { router, useNavigation } from "expo-router";
import ProfileListItem from "@/components/profileListItem";

const profilesecurity = () => {
  const { dark } = useTheme();
  const { goBack } = useNavigation();
  const themeStyles = {
    backgroundCont: dark ? COLORS.dark1 : COLORS.white,
    primaryText: dark ? COLORS.white : COLORS.dark1,
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeStyles.backgroundCont }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity onPress={goBack}>
            <Image
              source={icons.arrowBack}
              style={{
                width: 20,
                height: 20,
                marginBottom: 10,
                tintColor: themeStyles.primaryText,
              }}
            />
          </TouchableOpacity>
          <Text
            style={[
              { fontWeight: "bold", fontSize: 25, marginVertical: 9 },
              { color: themeStyles.primaryText },
            ]}
          >
            Security settings
          </Text>
        </View>

        <View>
          <ProfileListItem
            text="Change Password"
            icon={icons.lock}
            onPress={() => {
              router.push("/changepassword");
            }}
          />
          <ProfileListItem
            text="Change transaction pin"
            icon={icons.lock}
            onPress={() => {
              router.push({
                pathname: "/setpinscreen",
                params: { title: "Enter new Pin", context: "transactionPin" },
              });
            }}
          />
          <ProfileListItem
            text="Face ID/Biometrics"
            icon={icons.scan2}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flex: 1,
  },

  icon: {
    width: 24,
    height: 24,
  },
});

export default profilesecurity;
