# Expo Router Example

Use [`expo-router`](https://docs.expo.dev/router/introduction/) to build native navigation using files in the `app/` directory.

## 🚀 How to use

```sh
npx create-expo-app -e with-router
```

## 📄 Adding Pages

In `expo-router`, pages are created as files within the app/ directory. Each file corresponds to a different route in your application. Here's how you can add pages:

1. Create a new file: Add a new file in the app/ directory, such as app/profile.js.

2. Define your page component: Inside the newly created file, define your React component:

```javascript
import { View, Text } from "react-native";

export default function Profile() {
  return (
    <View>
      <Text>This is the Profile Page</Text>
    </View>
  );
}
```

3. Access the page: The new page can be accessed by navigating to /profile in your app, corresponding to the file path app/profile.js

4. Nested routes: You can create nested routes by organizing files into subdirectories:

   - For example, adding app/settings/profile.js will create a route accessible at /settings/profile

### Dynamic Routes

You can also create dynamic routes by using square brackets in the file name, like `app/[id].js`. This will allow dynamic parameters, such as `/123`, to be routed to this page.

```javascript
import { useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function DynamicPage() {
  const { params } = useRouter();
  return (
    <View>
      <Text>Page ID: {params.id}</Text>
    </View>
  );
}
```

## Constants

You can organize constants in a separate file and reuse them across pages. This can be useful for storing configuration settings, static values, or route names.

1. Create a constants file: For example, create `constants/constants.js` and define constants there

```javascript
export const API_URL = "https://api.example.com";
export const PAGE_TITLES = {
  home: "Home Page",
  profile: "Profile Page",
};
```

## 📝 Notes

- [Expo Router: Docs](https://docs.expo.dev/router/introduction/)
