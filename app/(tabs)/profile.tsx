import { ScrollView, StyleSheet, Text, View } from "react-native";
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

const Profile = () => {
  const { userData } = useAuth();
  const { logout } = useAuth();
  const { dark } = useTheme();
  
  const imageShown = `${API_BASE_URL}/uploads/${userData?.profilePicture}`

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={{ position: "relative" }}>
        <Image
          source={images.connectingAgentBg}
          style={{ width: "100%", height: 270, objectFit: "cover" }}
        />
        <View
          style={{
            position: "absolute",
            inset: 0,
            paddingVertical: 20,
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
                fontSize: 20,
              }}
            >
              Profile
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Image
              source={userData?.profilePicture ? { uri: imageShown } : images.userProfile}
              style={{ width: 110, height: 110, borderRadius: 60 }}
            />
            <Text
              style={{
                color: COLORS.white,
                paddingTop: 10,
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              {userData?.firstname}{userData?.lastname}
            </Text>
            <Text style={{ color: COLORS.white }}>
              {userData?.username}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={{ flex: 1, backgroundColor: dark ? COLORS.black : COLORS.white }}
      >
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
            text="Privacy Policy"
            icon={icons.privacyPolicy}
            onPress={() => {}}
          />
          <ProfileListItem
            text="Terms of Services"
            icon={icons.termsAndServices}
            onPress={() => {}}
          />
          {/* <ProfileListItem
            text="Customer Support"
            icon={icons.analyticsOutline}
            onPress={() => {}}
          /> */}
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
            onPress={() => {}}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
