// import React, { useState, useEffect, useRef } from "react";
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Dimensions,
//   PanResponder,
//   ScrollView,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import Button from "@/utils/Button";
// import { COLORS, icons } from "@/constants";
// import { Image } from "expo-image";
// import { useTheme } from "@/contexts/themeContext";
// import { router } from "expo-router";

// // Assuming you have a custom button component
// const { height: screenHeight } = Dimensions.get("window");

// interface DraggableModalProps {
//   isVisible: boolean;
//   onClose: () => void;
// }

// const DraggableModal: React.FC<DraggableModalProps> = ({
//   isVisible,
//   onClose,
// }) => {
//   const [modalHeight] = useState(new Animated.Value(0));
//   const translateY = useRef(new Animated.Value(0)).current;

//   const { dark } = useTheme();
//   // Drag responder logic
//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onPanResponderMove: (_, gestureState) => {
//       if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
//     },
//     onPanResponderRelease: (_, gestureState) => {
//       if (gestureState.dy > 100) {
//         onClose(); // Close modal if dragged down too far
//       } else {
//         Animated.spring(translateY, {
//           toValue: 0, // Reset position
//           useNativeDriver: false,
//         }).start();
//       }
//     },
//   });

//   useEffect(() => {
//     if (isVisible) {
//       translateY.setValue(screenHeight);
//       Animated.parallel([
//         Animated.timing(modalHeight, {
//           toValue: screenHeight * 0.7,
//           duration: 300,
//           useNativeDriver: false,
//         }),
//         Animated.timing(translateY, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: false,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(modalHeight, {
//           toValue: 0,
//           duration: 300,
//           useNativeDriver: false,
//         }),
//         Animated.timing(translateY, {
//           toValue: screenHeight,
//           duration: 300,
//           useNativeDriver: false,
//         }),
//       ]).start();
//     }
//   }, [isVisible]);

//   const themeStyles = {
//     background: dark ? COLORS.dark2 : COLORS.white,
//     normalText: dark ? COLORS.white : COLORS.black,
//     verifiedBackground: dark ? COLORS.grayscale200 : COLORS.transparentAccount,
//     iconBackground: dark ? COLORS.primary : COLORS.grayscale200,
//   };

//   return (
//     <ScrollView>
//       <Modal visible={isVisible} animationType="fade" transparent>
//         <View style={styles.overlay}>
//           <View>
//             <Animated.View
//               {...panResponder.panHandlers}
//               style={[
//                 styles.modalContainer,
//                 { backgroundColor: themeStyles.background },
//                 { height: modalHeight, transform: [{ translateY }] },
//               ]}
//             >
//               <View style={{ margin: "auto" }}>
//                 <Text
//                   style={{
//                     height: 4,
//                     margin: "auto",
//                     width: 40,
//                     backgroundColor: COLORS.greyscale300,
//                   }}
//                 ></Text>
//                 <View>
//                   <View
//                     style={[
//                       styles.iconContainer,
//                       {
//                         backgroundColor: themeStyles.iconBackground,
//                       },
//                     ]}
//                   >
//                     <Image
//                       source={icons.activity}
//                       style={[
//                         styles.icon,
//                         { tintColor: themeStyles.normalText },
//                       ]}
//                     />
//                   </View>
//                   <Text
//                     style={[styles.title, { color: themeStyles.normalText }]}
//                   >
//                     Upgrade to Tier 2
//                   </Text>
//                   <Text
//                     style={[
//                       styles.description,
//                       { color: themeStyles.normalText },
//                     ]}
//                   >
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit,
//                     dolor sit amet dolor.
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.body}>
//                 <Text
//                   style={[
//                     styles.requirementsTitle,
//                     { color: themeStyles.normalText, paddingLeft: 13 },
//                   ]}
//                 >
//                   Requirements
//                 </Text>
//                 <Text
//                   style={[
//                     styles.requirement,
//                     { color: themeStyles.normalText, paddingLeft: 13 },
//                   ]}
//                 >
//                   - BVN Verification
//                 </Text>

//                 <View
//                   style={[
//                     styles.infoBox,
//                     {
//                       flexDirection: "row",
//                       gap: 7,
//                       alignItems: "center",
//                       paddingHorizontal: 10,
//                     },
//                   ]}
//                 >
//                   <Image
//                     source={icons.activity}
//                     style={{
//                       tintColor: themeStyles.normalText,
//                       width: 18,
//                       height: 18,
//                     }}
//                   />
//                   <Text
//                     style={[
//                       { fontSize: 12 },
//                       { color: themeStyles.normalText },
//                     ]}
//                   >
//                     Your daily limit will be increased to unlimited for all
//                     crypto and Gift Card Transactions
//                   </Text>
//                 </View>
//               </View>

//               <View style={{ padding: 15, marginBottom: 10 }}>
//                 <Button
//                   title="Continue"
//                   onPress={() => router.push("/bvnverification")}
//                 />
//               </View>
//             </Animated.View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.3)",
//     justifyContent: "flex-end",
//   },
//   icon: {
//     width: 40,
//     height: 40,
//   },
//   modalContainer: {
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   iconContainer: {
//     margin: "auto",
//     marginVertical: 20,
//     padding: 20,
//     borderRadius: 50,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   body: {
//     marginBottom: 24,
//     paddingHorizontal: 10,
//   },
//   description: {
//     fontSize: 14,
//     textAlign: "center",
//     marginVertical: 10,
//     paddingHorizontal: 20,
//   },
//   requirementsTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   requirement: {
//     fontSize: 14,
//     color: "#333",
//     marginBottom: 6,
//   },
//   infoBox: {
//     backgroundColor: COLORS.transparentAccount,
//     padding: 12,
//     marginTop: 15,
//     borderWidth: 1,
//     borderColor: COLORS.primary,
//     borderRadius: 20,
//     marginHorizontal: 7,
//   },
// });

// export default DraggableModal;
