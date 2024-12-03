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

const Profile = () => {
  const { dark } = useTheme();
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
            <Image
              source={icons.notification}
              style={{ width: 30, height: 30, tintColor: COLORS.white }}
            />
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Image
              source={images.coverImage}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <Text
              style={{
                color: COLORS.white,
                paddingTop: 10,
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Emmanuel Richards
            </Text>
            <Text style={{ color: COLORS.white }}>
              @emmanuelrichards • Tier 1
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
            icon={icons.userDefault}
            onPress={() => {
              router.push("/editprofile");
            }}
          />
          <ProfileListItem
            text="KYC Level"
            icon={icons.bag}
            onPress={() => {
              router.push("/updatekyclevel");
            }}
          />
          <ProfileListItem
            text="Security"
            icon={icons.security}
            onPress={() => {
              router.push("/profilesecurity");
            }}
          />
          <ProfileListItem
            text="Privacy Policy"
            icon={icons.wallet2Outline}
            onPress={() => {}}
          />
          <ProfileListItem
            text="Terms of Services"
            icon={icons.more}
            onPress={() => {}}
          />
          <ProfileListItem
            text="Customer Support"
            icon={icons.analyticsOutline}
            onPress={() => {}}
          />
          <ProfileListItem
            text="Log out"
            icon={icons.logout}
            onPress={() => {}}
          />
          <ProfileListItem
            text="Delete Account"
            icon={icons.trash}
            onPress={() => {}}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
