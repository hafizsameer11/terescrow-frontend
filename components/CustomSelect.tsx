import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from "react-native";
import React from "react";
import { useTheme } from "@/contexts/themeContext";
import { COLORS, icons, SIZES } from "@/constants";
import { Image } from "expo-image";
import SelectModal from "@/components/SelectModal";
const { width } = Dimensions.get("window");
const isTablet = width >= 768; // iPads and larger devices
interface SelectProps {
  error?: string | undefined;
  touched?: boolean | undefined;
  options: { id: number; title: string }[];
  id: string;
  modalLabel: string;
  setFieldValue: (field: string, value: any) => void;
  currValue: string;
  placeholder: string;
  onSelectOverride?: (value: any) => void; // New prop for custom logic
  isGiftCard?: boolean;
  isSignup?: boolean;
  variant?: 'default' | 'signin';
}
const CustomSelect = ({
  error,
  touched,
  options,
  id,
  modalLabel,
  setFieldValue,
  currValue,
  placeholder,
  onSelectOverride,
  isGiftCard = false, // Default to false if not provided
  isSignup,
  variant = 'default'
}: SelectProps) => {
  const { dark } = useTheme();
  const [modalVisible, setIsVisible] = React.useState(false);
  const isSigninVariant = variant === 'signin';
  const selectedOption = currValue && options.find((o) => o.id.toString() === currValue);

  //   console.log(error);
  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <View
          style={{
            height: isSigninVariant ? 56 : 50,
            borderWidth: 1,
            borderColor: error && touched ? COLORS.error : (isSigninVariant ? '#e2d9ec' : COLORS.greyscale300),
            paddingHorizontal: isSigninVariant ? 16 : 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: isSigninVariant ? 0 : 7,
            marginBottom: isSigninVariant ? 0 : 16,
            borderRadius: isSigninVariant ? 12 : SIZES.padding,
            backgroundColor: isSigninVariant ? '#FEFEFE' : 'transparent',
          }}
        >
          {isSigninVariant && selectedOption ? (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#989898', marginBottom: 2 }}>
                {placeholder}
              </Text>
              <Text style={{ fontSize: 16, color: '#1e1e1e' }}>
                {selectedOption.title}
              </Text>
            </View>
          ) : (
            <Text
              style={{
                color: currValue
                  ? (isSigninVariant ? '#1e1e1e' : (dark ? "#E2D9EC" : COLORS.grayscale700))
                  : (isSigninVariant ? '#989898' : (dark ? COLORS.greyscale300 : COLORS.greyscale600)),
                fontSize: isSigninVariant ? (currValue ? 16 : 16) : (isTablet ? 20 : 16)
              }}
            >
              {currValue && selectedOption
                ? selectedOption.title
                : placeholder}
            </Text>
          )}

          <Image
            source={isSigninVariant ? icons.arrowDown : icons.arrowRight}
            style={{
              width: isSigninVariant ? 20 : 18,
              height: isSigninVariant ? 20 : 18,
              tintColor: isSigninVariant ? '#989898' : (dark ? COLORS.greyscale300 : COLORS.greyscale600),
            }}
          />
        </View>

        {error && touched && (
          <Text
            style={{
              color: COLORS.red,
              marginTop: 5,
              fontSize: 12,
              marginBottom: SIZES.padding2,
            }}
          >
            {error}
          </Text>
        )}
      </TouchableOpacity>

      <SelectModal
        isVisible={modalVisible}
        setIsVisible={setIsVisible}
        onSelect={(value, title) => {
          console.log("Selected value:", value, " title:", title);
          if (isSignup) {
            // 🧾 SignUp screen using Formik — use field name `id`
            setFieldValue(id, value);
          } else if (isGiftCard) {
            // 🎁 Gift card logic — swap params as expected
            setFieldValue(title, value); // title = label, value = id
          } else {
            // Default fallback — Formik logic
            setFieldValue(title, value);
          }
          // if(isGiftCard){
          //   setFieldValue(title, value);
          // }else{

          //   setFieldValue(title, value);
          // }
        }}
        title={modalLabel}
        options={options}
      />
    </>
  );
};

export default CustomSelect;

const styles = StyleSheet.create({});
