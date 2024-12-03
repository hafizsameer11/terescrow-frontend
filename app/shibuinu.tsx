// import { ScrollView, StyleSheet, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import NavigateBack from "@/components/NavigateBack";
// import CryptoCardCom from "@/components/CryptoCardCom";
// import { icons } from "@/constants";
// import InformationFields from "@/components/InformationFields";
// import CustomProceed from "@/components/CustomProceed";
// import { COLORS } from "@/constants";
// import { useTheme } from "@/contexts/themeContext";
// const ShibuInu = () => {
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
//             <NavigateBack text="Shibu Inu" />
//           </View>
//           <View>
//             <CryptoCardCom card={icons.shibaInu} />
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

// export default ShibuInu;
