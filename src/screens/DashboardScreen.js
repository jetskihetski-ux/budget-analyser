import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../storage/storage';
import { getCategoryById } from '../constants/categories';

const INCOME_COLOR  = '#4CAF50';
const EXPENSE_COLOR = '#FF5252';
const ACCENT        = '#6C63FF';

export default function DashboardScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);

  useFocusEffect(
    useCallback(() => { getTransactions().then(setTransactions); }, [])
  );

  const now       = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const income   = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;
  const recent   = transactions.slice(0, 5);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greeting}>Good day 👋</Text>
        <Text style={s.month}>
          {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Balance card */}
      <View style={s.card}>
        <Text style={s.cardLabel}>Total Balance</Text>
        <Text style={[s.balance, { color: balance >= 0 ? INCOME_COLOR : EXPENSE_COLOR }]}>
          ${balance.toFixed(2)}
        </Text>
        <View style={s.row}>
          <StatBox label="Income" amount={income} color={INCOME_COLOR} arrow="↓" />
          <View style={s.sep} />
          <StatBox label="Expenses" amount={expenses} color={EXPENSE_COLOR} arrow="↑" />
        </View>
      </View>

      {/* Recent */}
      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recent.length === 0
          ? <Text style={s.empty}>No transactions yet — tap + to add one</Text>
          : recent.map((t) => <TxRow key={t.id} t={t} />)}
      </View>

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddTransaction')}>
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatBox({ label, amount, color, arrow }) {
  return (
    <View style={s.statBox}>
      <Text style={{ color, fontSize: 18 }}>{arrow}</Text>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statAmount, { color }]}>${amount.toFixed(2)}</Text>
    </View>
  );
}

function TxRow({ t }) {
  const cat = getCategoryById(t.categoryId);
  return (
    <View style={s.txRow}>
      <View style={[s.txIcon, { backgroundColor: cat.color + '33' }]}>
        <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
      </View>
      <View style={s.txInfo}>
        <Text style={s.txDesc}>{t.description || cat.label}</Text>
        <Text style={s.txDate}>{new Date(t.date).toLocaleDateString()}</Text>
      </View>
      <Text style={[s.txAmount, { color: t.type === 'income' ? '#4CAF50' : '#FF5252' }]}>
        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#1E1E2E' },
  header:       { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  greeting:     { color: '#fff', fontSize: 24, fontWeight: '700' },
  month:        { color: '#888', fontSize: 14, marginTop: 2 },
  card:         { margin: 16, padding: 24, backgroundColor: ACCENT, borderRadius: 24 },
  cardLabel:    { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  balance:      { fontSize: 40, fontWeight: '800', marginVertical: 6 },
  row:          { flexDirection: 'row', marginTop: 20 },
  sep:          { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 16 },
  statBox:      { flex: 1, alignItems: 'center', gap: 4 },
  statLabel:    { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  statAmount:   { fontWeight: '700', fontSize: 16 },
  section:      { marginHorizontal: 16, marginTop: 8 },
  sectionRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  seeAll:       { color: ACCENT, fontSize: 13 },
  empty:        { color: '#555', textAlign: 'center', marginTop: 32, fontSize: 14 },
  txRow:        {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2D2D3F', borderRadius: 14,
    padding: 14, marginBottom: 10,
  },
  txIcon:       { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo:       { flex: 1 },
  txDesc:       { color: '#fff', fontWeight: '500', fontSize: 14 },
  txDate:       { color: '#666', fontSize: 12, marginTop: 2 },
  txAmount:     { fontWeight: '700', fontSize: 15 },
  fab:          {
    position: 'absolute', right: 24, bottom: 24,
    backgroundColor: ACCENT, width: 56, height: 56,
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
  fabIcon:      { color: '#fff', fontSize: 32, lineHeight: 36 },
});
