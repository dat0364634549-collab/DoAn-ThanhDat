import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Screen from '../components/Screen';
import { colors, shadow } from '../theme';

const contacts = [
  {
    label: 'Điện thoại',
    value: '0348588823',
    action: 'tel:0348588823',
    button: 'Gọi ngay'
  },
  {
    label: 'Email',
    value: 'dat0364634549@gmail.com',
    action: 'mailto:dat0364634549@gmail.com',
    button: 'Gửi email'
  },
  {
    label: 'Facebook',
    value: 'Thời Trang của Đạt',
    action: 'https://facebook.com/thoitrangcuadat',
    button: 'Mở Facebook'
  }
];

export default function ContactScreen() {
  async function openLink(url) {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  }

  return (
    <Screen edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.brandMark}>TD</Text>
          <Text style={styles.brandName}>Thành Đạt Shop</Text>
          <Text style={styles.brandText}>
            Thời trang nam nữ trẻ trung, chất lượng và giao hàng toàn quốc.
          </Text>
        </View>

        <Text style={styles.title}>Liên hệ với chúng tôi</Text>
        <Text style={styles.subtitle}>
          Chọn một phương thức bên dưới để được hỗ trợ.
        </Text>

        {contacts.map((contact) => (
          <View key={contact.label} style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.label}>{contact.label}</Text>
              <Text selectable style={styles.value}>{contact.value}</Text>
            </View>
            <Pressable onPress={() => openLink(contact.action)} style={styles.button}>
              <Text style={styles.buttonText}>{contact.button}</Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.address}>
          <Text style={styles.label}>Địa chỉ cửa hàng</Text>
          <Text style={styles.addressText}>123 Đường Thời Trang, Quận 1, TP.HCM</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    padding: 18,
    paddingBottom: 40
  },
  brand: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#19191b'
  },
  brandMark: {
    width: 78,
    paddingVertical: 17,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center'
  },
  brandName: {
    marginTop: 14,
    color: '#fff',
    fontSize: 24,
    fontWeight: '900'
  },
  brandText: {
    marginTop: 8,
    color: '#c8c8cc',
    lineHeight: 21,
    textAlign: 'center'
  },
  title: {
    marginTop: 28,
    color: colors.text,
    fontSize: 27,
    fontWeight: '900'
  },
  subtitle: {
    marginTop: 7,
    marginBottom: 18,
    color: colors.muted
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    ...shadow
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10
  },
  label: {
    color: colors.text,
    fontWeight: '900'
  },
  value: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 13
  },
  button: {
    flexShrink: 0,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ef4b3b'
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900'
  },
  address: {
    marginTop: 5,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: '#fff'
  },
  addressText: {
    marginTop: 7,
    color: colors.muted,
    lineHeight: 21
  }
});
