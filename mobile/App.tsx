import React from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const demoInvoices = [
  { id: 1, folio: 'CL-2026-0001', customer: 'Abarrotes Lupita', total: '$1,392.00 MXN', status: 'Pendiente' },
  { id: 3, folio: 'CL-2026-0003', customer: 'Clínica Roma', total: '$2,552.00 MXN', status: 'Vencido' }
];

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Cobros LATAM</Text>
        <Text style={styles.title}>Cobranza móvil para México</Text>
        <Text style={styles.subtitle}>Consulta facturas y comparte ligas de Mercado Pago con clientes en ruta.</Text>
        {demoInvoices.map((invoice) => (
          <View key={invoice.id} style={styles.card}>
            <Text style={styles.folio}>{invoice.folio}</Text>
            <Text style={styles.customer}>{invoice.customer}</Text>
            <Text style={styles.total}>{invoice.total}</Text>
            <Text style={styles.status}>{invoice.status}</Text>
            <TouchableOpacity style={styles.button} onPress={() => Linking.openURL(`${apiUrl}/api/mercado-pago/preferences?invoiceId=${invoice.id}`)}>
              <Text style={styles.buttonText}>Abrir liga de pago</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, gap: 16 },
  kicker: { color: '#38bdf8', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  title: { color: 'white', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#cbd5e1', fontSize: 16, lineHeight: 24 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 20, gap: 8 },
  folio: { color: '#475569', fontWeight: '700' },
  customer: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  total: { color: '#0369a1', fontSize: 24, fontWeight: '800' },
  status: { color: '#b45309', fontWeight: '700' },
  button: { backgroundColor: '#0891b2', borderRadius: 14, marginTop: 12, padding: 14 },
  buttonText: { color: 'white', fontWeight: '800', textAlign: 'center' }
});
