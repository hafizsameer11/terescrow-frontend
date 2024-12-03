import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Image } from "expo-image";
import { COLORS, icons, SIZES } from "@/constants";
import { useTheme } from "@/contexts/themeContext";
import Button from "@/utils/Button";

type ModalProps = {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  onPress: () => void;
  buttonTitle?: string;
};

const SuccessModal = ({
  modalVisible,
  setModalVisible,
  onPress,
  buttonTitle,
}: ModalProps) => {
  const { dark } = useTheme();
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={[styles.modalContainer]}>
          <View
            style={[
              styles.modalSubContainer,
              {
                backgroundColor: dark ? COLORS.dark2 : COLORS.secondaryWhite,
              },
            ]}
          >
            <View style={{ backgroundColor: '#eafff7', padding: 12, borderRadius: 100 }}>
              <Image
                source={icons.tickMarked}
                contentFit="contain"
                style={styles.modalIllustration}
              />
            </View>
            <Text style={styles.modalTitle}>Sign up successful!</Text>
            <Text
              style={[
                styles.modalSubtitle,
                {
                  color: dark ? COLORS.grayTie : COLORS.greyscale900,
                },
              ]}
            >
              Your account has been successfully created.
            </Text>
            <Button
              title={buttonTitle || "Continue"}
              filled
              onPress={onPress}
              style={{
                width: "100%",
                marginTop: 12,
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SuccessModal;

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.black2,
    textAlign: "center",
    marginVertical: 12,
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSubContainer: {
    height: 400,
    width: "100%",
    backgroundColor: COLORS.white,
    borderStartStartRadius: 12,
    borderEndStartRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalIllustration: {
    height: 50,
    marginHorizontal: 22,
    width: 50,
    marginVertical: 22,
  },
});
