import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import styles from "./LoaderStyles";

const Loader = ({ message, size = "large" }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#0000ff" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

export default Loader;
