import { StyleSheet, View, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, icons } from '@/constants';
import React from 'react';

interface SearchProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

const SearchInputField = ({ searchTerm, setSearchTerm }: SearchProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Image source={icons.search} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.grayscale400}
          onChangeText={setSearchTerm}
          value={searchTerm}
          placeholder="Search..."
        />
      </View>
    </View>
  );
};

export default SearchInputField;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#ccc',
    marginRight: 8,
  },
});
