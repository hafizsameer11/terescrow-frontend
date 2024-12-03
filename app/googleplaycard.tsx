// import { ScrollView, StyleSheet, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import NavigateBack from "@/components/NavigateBack";
// import CardCom from "@/components/CardCom";
// import { COLORS, images } from "@/constants";
// import InformationFields from "@/components/InformationFields";
// import CustomProceed from "@/components/CustomProceed";
// import { useTheme } from "@/contexts/themeContext";

// const googleplaycard = () => {
//   const { dark } = useTheme();
//   return (
//     <SafeAreaView
//       style={[
//         { flex: 1 },
//         dark
//           ? { backgroundColor: COLORS.black }
//           : { backgroundColor: COLORS.white },
//       ]}
//     >
//       <View style={styles.container}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//           <View>
//             <NavigateBack text="Google Play" />
//           </View>
//           <View>
//             <CardCom card={images.googlePlayCard} />
//           </View>
//           <View>
//             <InformationFields />
//           </View>
//         </ScrollView>
//         <View style={styles.footer}>
//           <CustomProceed />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 60, 
//   },
//   footer: {
//     position: "relative",
//     bottom: 0,
//     width: "100%",
//     padding: 10,
//   },
// });

// export default googleplaycard;