import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useTheme } from '@/contexts/themeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants';
import ChatCategories from '@/components/ChatCategories';
import { FlatList } from 'react-native-reanimated/lib/typescript/Animated';
import ChatItem from '@/components/ChatItem';
import {
  DUMMY_DATA_ALL,
  DUMMY_DATA_COMP,
  DUMMY_DATA_DECLINE,
  DUMMY_DATA_PROCESS,
} from '../../utils/DummyData';

const chat = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const getFilteredData = () => {
    switch (selectedCategory) {
      case 'completed':
        return DUMMY_DATA_COMP;
      case 'processing':
        return DUMMY_DATA_PROCESS;
      case 'declined':
        return DUMMY_DATA_DECLINE;
      default:
        return DUMMY_DATA_ALL;
    }
  };

  const { dark } = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeadingContainer}>
        <Text style={styles.mainHeading}>Chat</Text>
      </View>
      <View
        style={[
          styles.mainContent,
          dark
            ? { backgroundColor: COLORS.black }
            : { backgroundColor: COLORS.white },
        ]}
      >
        <ChatCategories
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <View style={{ flex: 1 }}>
          <FlatList
            data={getFilteredData()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatItem
                icon={item.icon}
                heading={item.heading}
                text={item.text}
                date={item.date}
                price={item.price}
                productId={item.productId}
              />
            )}
            style={styles.dataList}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.green,
  },
  mainHeadingContainer: {
    flex: 0.15,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainHeading: {
    flex: 1,
    fontSize: 24,
    marginBottom: 20,
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'bottom',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
  },
  dataList: {
    marginTop: 10,
  },
});

export default chat;
