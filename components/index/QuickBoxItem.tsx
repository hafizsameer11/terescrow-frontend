import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/themeContext';
import { getImageUrl } from '@/utils/helpers';

const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPads generally have width 768+

const QuickBoxItem: React.FC<{
  icon: string;
  title: string;
  description: string;
  onClick: (item: any) => void;
}> = (props) => {
  const { dark } = useTheme();
  return (
    <Pressable
      style={[
        styles.container,
        dark
          ? { backgroundColor: COLORS.dark3 }
          : { backgroundColor: COLORS.grayscale100 },
      ]}
      onPress={props.onClick}
    >
      <View
        style={[
          styles.iconContainer,
          dark
            ? { backgroundColor: COLORS.white }
            : { backgroundColor: COLORS.transparentAccount },
        ]}
      >
        <Image source={{ uri: getImageUrl(props.icon) }} style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {props.title}
        </Text>
        <Text
          style={[
            styles.text,
            dark ? { color: COLORS.white } : { color: COLORS.black },
          ]}
        >
          {props.description}
        </Text>
      </View>
    </Pressable>
  );
};

export default QuickBoxItem;

const styles = StyleSheet.create({
  container: {
    width: isTablet ? '49%' : '47%', 
    padding: isTablet ? 18 : 12,
        flexDirection: 'column',
    backgroundColor: '#F7F7F7',
    marginBottom: isTablet ? 25 : 20, 
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom:isTablet?30:12
  },
  iconContainer: {
    width: isTablet ? 80 : 40,
    height: isTablet ? 80 : 40,
    borderRadius: isTablet?16:8,
    marginBottom: isTablet ? 16 : 12, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: isTablet ? 45 : 20, 
    height: isTablet ? 45 : 20, 
  },
  textContainer: {
    marginTop: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: isTablet ? 24 : 12, 
    marginBottom: isTablet ? 7 : 2, 
  },
  text: {
    fontSize: isTablet ? 18 : 10, 
    color: COLORS.greyscale600,
  },
});
