import React from 'react';
import { StyleSheet, View, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function AppEntry() {
  // REPLACE with your hosted Vercel/Netlify URL
  const WEB_APP_URL = 'https://casa-dossier.vercel.app/';

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        
        // --- HYBRID CONFIG ---
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        
        // --- UX POLISH ---
        bounces={false} // Prevents "web-style" rubber banding on iOS
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        
        // Android Performance
        androidLayerType="hardware"
        
        // Debugging (Remove in production)
        onNavigationStateChange={(navState) => {
          console.log("Current URL:", navState.url);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Match Slate 950
    // Fix for Android safe area
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: '#020617',
  },
});