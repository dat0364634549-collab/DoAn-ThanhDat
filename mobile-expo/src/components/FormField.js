import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

export default function FormField({ label, error, style, ...props }) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#98a2b3"
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 7, color: colors.text, fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16
  },
  inputError: { borderColor: colors.danger },
  error: { marginTop: 5, color: colors.danger, fontSize: 12 }
});
