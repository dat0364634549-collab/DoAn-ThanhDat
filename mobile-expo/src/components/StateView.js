import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import PrimaryButton from './PrimaryButton';

export default function StateView({ loading, title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onAction ? (
        <PrimaryButton title={actionLabel || 'Thử lại'} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { marginTop: 16, color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  message: { marginTop: 8, color: colors.muted, lineHeight: 21, textAlign: 'center' },
  button: { minWidth: 140, marginTop: 18 }
});
