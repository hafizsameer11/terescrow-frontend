import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useTheme } from '@/contexts/themeContext';
import { COLORS, icons, SIZES } from '@/constants';
import { Image } from 'expo-image';
import SelectModal from '@/components/SelectModal';

interface SelectProps {
  error: string | undefined;
  touched: boolean | undefined;
  options: { label: string; value: string }[];
  id: string;
  modalLabel: string;
  setFieldValue: (field: string, value: any) => void;
  currValue: string;
  placeholder: string;
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
}: SelectProps) => {
  const { dark } = useTheme();
  const [modalVisible, setIsVisible] = React.useState(false);

  //   console.log(error);
  return (
    <>
      <TouchableOpacity onPress={() => setIsVisible(true)}>
        <View
          style={{
            height: 50,
            borderWidth: 1,
            borderColor: COLORS.greyscale600,
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 7,
            marginBottom: 16,
            borderRadius: SIZES.padding,
          }}
        >
          <Text
            style={{
              color: currValue
                ? dark
                  ? '#E2D9EC'
                  : COLORS.grayscale700
                : dark
                ? COLORS.greyscale300
                : COLORS.greyscale600,
              fontSize: 16,
            }}
          >
            {currValue
              ? options.find((o) => o.value === currValue)?.label
              : placeholder}
          </Text>

          <Image
            source={icons.arrowRight}
            style={{
              width: 18,
              height: 18,
              tintColor: dark ? COLORS.greyscale300 : COLORS.greyscale600,
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
        onSelect={(value) => setFieldValue(id, value)}
        title={modalLabel}
        options={options}
      />
    </>
  );
};

export default CustomSelect;

const styles = StyleSheet.create({});
