import { useRef } from "react";
import { View, Button, StyleSheet } from "react-native";
import Form from "../components/Form";

const styles = StyleSheet.create({
  container: {
    flex: 1, // Use flex to occupy full height and allow proper alignment
    padding: 20,
    backgroundColor: "#f0f0f0", // Light gray background for contrast
  },
  formContainer: {
    marginBottom: 20,
    flexDirection: "row", // Set direction to row for horizontal alignment
    alignItems: "center", // Center align items vertically
  },
  label: {
    marginRight: 10, // Space between label and input
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    backgroundColor: "white",
    flex: 1, // Allow input to take up available space
  },
});

export default function App() {
  const formRef = useRef();

  const handleSubmit = () => {
    if (formRef.current) {
      const formData = formRef.current.getFormData();
      console.log(formData);
    }
  };

  const options = [
    {
      type: "container",
      style: styles.formContainer,
      children: [
        {
          type: "label",
          label: "Name: ",
          style: styles.label,
        },
        {
          type: "text",
          name: "input",
          placeholder: "myinput",
          style: styles.input,
        },
      ],
    },
    { type: "checkbox" },
    { type: "switch" },
    { type: "dropdown", name: "do" },
  ];

  return (
    <View style={styles.container}>
      <Form ref={formRef} options={options} />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
