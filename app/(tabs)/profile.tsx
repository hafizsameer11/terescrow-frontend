import { Alert, Linking, ScrollView, StyleSheet, Text, View,Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image } from "expo-image";
import { COLORS, icons, images } from "@/constants";
import Header from "@/components/index/Header";
import ProfileListItem from "@/components/profileListItem";
import { AntDesign } from "@expo/vector-icons";
import { useTheme } from "@/contexts/themeContext";
import { router } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { API_BASE_URL } from "@/utils/apiConfig";
import { useQuery } from "@tanstack/react-query";
import { getPrivacyPageLinks } from "@/utils/queries/quickActionQueries";

const { width } = Dimensions.get("window");
const isTablet = width >= 768; // iPads and larger devices

const Profile = () => {
  const { userData, token } = useAuth();
  const { logout } = useAuth();
  const { dark } = useTheme();
  const { data: privacyData } = useQuery({
    queryKey: ['privacy'],
    queryFn: () => getPrivacyPageLinks(),
    enabled: !!token
  })
  const imageShown = `${API_BASE_URL}/uploads/${userData?.profilePicture}`

  const handlePress = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={{ position: "relative" }}>
        <Image
          source={images.connectingAgentBg}
          style={{ width: "100%", height: isTablet ? 320 : 270, objectFit: "cover" }}
        />
        <View
          style={{
            position: "absolute",
            inset: 0,
            paddingVertical: isTablet ? 30 : 20,
            paddingHorizontal: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 18,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontWeight: "bold",
                fontSize: isTablet ? 26 : 20,
              }}
            >
              Profile
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Image
              source={userData?.profilePicture ? { uri: imageShown } : images.userProfile}
              style={{
                width: isTablet ? 140 : 110,
                height: isTablet ? 140 : 110,
                borderRadius: 70,
              }}
            />
            <Text
              style={{
                color: COLORS.white,
                paddingTop: 10,
                fontWeight: "bold",
                fontSize: isTablet ? 22 : 18,
              }}
            >
              {userData?.firstname}{userData?.lastname}
            </Text>
            <Text style={{ color: COLORS.white, fontSize: isTablet ? 16 : 14 }}>
              {userData?.username}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: dark ? COLORS.black : COLORS.white }}>
        <ScrollView>
          <ProfileListItem
            text="Edit Profile"
            icon={icons.userEdit}
            onPress={() => {
              router.push("/editprofile");
            }}
          />
          <ProfileListItem
            text="KYC Level"
            icon={icons.personalCard}
            onPress={() => {
              router.push("/updatekyclevel");
            }}
          />
          <ProfileListItem
            text="Security"
            icon={icons.lockUser}
            onPress={() => {
              router.push("/profilesecurity");
            }}
          />
           <ProfileListItem
            text="Notification Settings"
            icon={icons.notification}
            // icon={icons.lockUser}
            onPress={() => {
              router.push("/NotificationSettings");
            }}
          />
          <ProfileListItem
            text="Privacy Policy"
            icon={icons.privacyPolicy}
            onPress={() => { handlePress(privacyData?.data?.privacyPageLink) }}
          />
          <ProfileListItem
            text="Terms of Services"
            icon={icons.termsAndServices}
            onPress={() => { handlePress(privacyData?.data?.termsPageLink) }}
          />
          <ProfileListItem
            text="Log out"
            icon={icons.logoutUser}
            areLast
            onPress={() => {
              logout();
            }}
          />
          <ProfileListItem
            text="Delete Account"
            areLast
            icon={icons.deleteAccount}
            onPress={() => { }}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
