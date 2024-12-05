import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useTheme } from '@/contexts/themeContext';
import { Colors } from '@/constants/Colors';
import { COLORS } from '@/constants';

interface CounterInputProps {
  counter: number;
  setCounter?: (count: number) => void;
  text: string;
  type: 'quantity' | 'counter';
}

const CounterInput = ({
  counter,
  setCounter,
  text,
  type,
}: CounterInputProps) => {
  const { dark } = useTheme();

  return (
    <View style={styles.inputWithCounter}>
      <Text
        style={[
          styles.mainText,
          dark ? { color: Colors.dark.text } : { color: Colors.light.text },
        ]}
      >
        {text}
      </Text>
      {setCounter && type == 'counter' && (
        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={() => setCounter(counter > 0 ? counter - 1 : 0)}
            style={styles.counterButton}
          >
            <Text style={[styles.counterText, styles.specialCase]}>-</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.counterValue,
              dark ? { color: Colors.dark.text } : { color: Colors.light.text },
            ]}
          >
            {counter}
          </Text>
          <TouchableOpacity
            onPress={() => setCounter(counter + 1)}
            style={styles.counterButton}
          >
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
      {type == 'quantity' && (
        <View style={styles.quantityContainer}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 50,
              paddingHorizontal: 10,
              paddingVertical: 2,
              backgroundColor: dark ? COLORS.greyscale500 : '#616161',
            }}
          >
            <Text style={{ color: dark ? COLORS.black : COLORS.white }}>
              {counter.toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CounterInput;

const styles = StyleSheet.create({
  mainText: {
    fontSize: 16,
    color: COLORS.grayscale700,
    fontWeight: 'semibold',
  },
  inputWithCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingLeft: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: COLORS.greyscale300,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  counterButton: {
    borderRadius: 50,
    marginHorizontal: 16,
    backgroundColor: COLORS.greyscale600,
  },
  counterText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'semibold',
    paddingHorizontal: 7,
  },
  counterValue: {
    fontSize: 16,
    color: '#333',
  },
  specialCase: {
    paddingHorizontal: 10,
  },
});
