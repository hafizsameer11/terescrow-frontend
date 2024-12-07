import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/themeContext';

const CryptoItem: React.FC<{
  icon: string;
  title: string;
  subTitle: string;
  onSend: () => void;
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
      onPress={props.onSend}
    >
      <View style={styles.iconContainer}>
        <Image source={props.icon} style={styles.icon} contentFit="contain" />
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
          {props.subTitle}
        </Text>
      </View>
    </Pressable>
  );
};

export default CryptoItem;

const styles = StyleSheet.create({
  container: {
    width: '45%',
    padding: 12,
    flexDirection: 'column',
    marginHorizontal: 10,
    backgroundColor: '#F7F7F7',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 40,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    marginTop: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    color: COLORS.greyscale600,
  },
});
