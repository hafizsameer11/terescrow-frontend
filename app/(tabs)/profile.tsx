import { Alert, Linking, ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPrivacyPageLinks } from "@/utils/queries/quickActionQueries";
import { deleteCustomer } from "@/utils/queries/accountQueries";

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
  const { mutate: DeleteAccount } = useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: () => deleteCustomer(token),
    onSuccess: () => {
      logout()
    },
    onError: (error) => {
      Alert.alert('Error', error.message)
    }
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
  const deleteAccount=()=>{
    DeleteAccount();
  }


  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
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
              <TouchableOpacity
                onPress={() => {
                  router.push("/notificationpage");
                }}
              >
                <Image
                  source={images.notification}
                  style={{
                    width: isTablet ? 28 : 24,
                    height: isTablet ? 28 : 24,
                  }}
                  contentFit="contain"
                />
              </TouchableOpacity>
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
                {userData?.firstname} {userData?.lastname}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: COLORS.white, fontSize: isTablet ? 16 : 14 }}>
                  @{userData?.username}
                </Text>
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: COLORS.white,
                  }}
                />
                <Text style={{ color: COLORS.white, fontSize: isTablet ? 16 : 14 }}>
                  Tier 2
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: dark ? COLORS.black : COLORS.white }}>
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
            text="Referrals"
            icon={icons.gift}
            onPress={() => {
              router.push("/referrals");
            }}
          />
          <ProfileListItem
            text="Support"
            icon={icons.people}
            onPress={() => {
              router.push("/(tabs)/support");
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
            onPress={() => { handlePress((privacyData as any)?.data?.privacyPageLink) }}
          />
          <ProfileListItem
            text="Terms of Services"
            icon={icons.termsAndServices}
            onPress={() => { handlePress((privacyData as any)?.data?.termsPageLink) }}
          />
          <ProfileListItem
            text="Trade Crypto"
            icon={icons.graph}
            onPress={() => {
              router.push({
                pathname: "/selectasset",
                params: { fromTradeCrypto: 'true' }
              });
            }}
          />
          <ProfileListItem
            text="Withdrawal Accounts"
            icon={icons.chatBubble}
            onPress={() => {
              router.push("/withdrawaccounts");
            }}
          />
          <ProfileListItem
            text="Bill Payments"
            icon={icons.payment}
            onPress={() => {
              router.push("/billpayments");
            }}
          />
          <ProfileListItem
            text="Buy gift cards"
            icon={icons.gift}
            onPress={() => {
              router.push("/buygiftcards");
            }}
          />
          
          {/* Other Settings Section */}
          <View style={{ paddingHorizontal: isTablet ? 20 : 10, paddingTop: 20, paddingBottom: 10 }}>
            <Text
              style={{
                fontSize: isTablet ? 18 : 16,
                fontWeight: "bold",
                color: dark ? COLORS.white : COLORS.black,
              }}
            >
              Other settings
            </Text>
          </View>
          
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
            onPress={() => { deleteAccount()
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
