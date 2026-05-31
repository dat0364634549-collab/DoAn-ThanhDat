import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const publicSiteOrigin = 'https://thanhdatshop-api.onrender.com';
const localSiteOrigin = 'http://localhost:3900';

function getRequestedPagePath() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return '/index.html';
  }

  const path = window.location.pathname || '/';
  return path === '/' ? '/index.html' : path;
}

function getWebsiteUrl() {
  const origin = Platform.OS === 'web' ? localSiteOrigin : publicSiteOrigin;
  return `${origin}${getRequestedPagePath()}`;
}

const websiteUrl = getWebsiteUrl();
const websiteUrlWithVersion = `${websiteUrl}?v=main-web-admin-20260531`;

export default function App() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <iframe
          title="Thoi Trang Cua Dat"
          src={websiteUrlWithVersion}
          style={styles.iframe}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: websiteUrlWithVersion }}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        renderError={() => (
          <View style={styles.message}>
            <Text style={styles.title}>Khong mo duoc website</Text>
            <Text style={styles.text}>Kiem tra backend va Cloudflare Tunnel dang chay.</Text>
            <Text style={styles.url}>{websiteUrl}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  message: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#222'
  },
  text: {
    marginBottom: 12,
    textAlign: 'center',
    color: '#555'
  },
  url: {
    color: '#0b65c2'
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  iframe: {
    width: '100%',
    height: '100vh',
    borderWidth: 0,
    borderStyle: 'none'
  }
});
