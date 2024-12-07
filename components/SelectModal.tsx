import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  PanResponder,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Appearance,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/themeContext';

interface CustomModalProps {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  onSelect: (value: string) => void;
  title: string;
  prefilledValue?: string;
  options: { id: number; title: string }[];
}

const { height: screenHeight } = Dimensions.get('window');

const SelectModal: React.FC<CustomModalProps> = ({
  isVisible,
  onSelect,
  setIsVisible,
  prefilledValue,
  options,
  title,
}) => {
  const { dark } = useTheme();
  // const options =
  //   type === 'country'
  //     ? ['Nigeria', 'Ghana', 'Cameroon', 'South Africa', 'Kenya']
  //     : ['Male', 'Female', 'Other'];

  const [modalHeight] = useState(new Animated.Value(0)); // Initial modal height set to 0
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        setIsVisible(false);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (isVisible) {
      // Reset translateY to ensure proper animation
      translateY.setValue(screenHeight);

      Animated.parallel([
        Animated.timing(modalHeight, {
          toValue: screenHeight / 2,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isVisible]);

  // Render each option
  const renderOption = ({ title, id }: { title: string; id: number }) => {
    const handleSelectId = () => {
      setIsVisible(false);
      onSelect(id.toString());
    };
    return (
      <TouchableOpacity style={styles.option} onPress={handleSelectId}>
        <Text style={[styles.optionText, { color: dark ? '#fff' : '#000' }]}>
          {title}
        </Text>
        <View style={styles.optionRight}>
          {title === prefilledValue && <View style={styles.redDot} />}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={dark ? '#fff' : '#C4C4C4'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss(); // Dismiss the keyboard if it's open
          setIsVisible(false); // Close the modal when the backdrop is tapped
        }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.modalContainer,
              {
                height: modalHeight, // Animate height
                transform: [{ translateY }], // Animate position
                backgroundColor: dark ? '#333' : '#fff',
              },
            ]}
          >
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: dark ? '#555' : '#E0E0E0' },
              ]}
            />

            {/* Title */}
            <Text style={[styles.title, { color: dark ? '#fff' : '#000' }]}>
              {title}
            </Text>

            {/* Options List */}
            <FlatList
              data={options}
              renderItem={({ item }) => renderOption(item)}
              keyExtractor={(item) => item.id.toString()}
            />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 16,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    marginRight: 8,
  },
});

export default SelectModal;
