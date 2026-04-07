import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteTransaction } from '../storage/storage';
import { getCategoryById } from '../constants/categories';

const FILTERS = ['All', 'Income', 'Expense'];
const ACCENT  = '#6C63FF';

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter]             = useState('All');

  useFocusEffect(
    useCallback(() => { getTransactions().then(setTransactions); }, [])
  );

  const filtered = transactions.filter((t) => {
    if (filter === 'All') return true;
    return t.type === filter.toLowerCase();
  });

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const updated = await deleteTransaction(id);
          setTransactions(updated);
        },
      },
    ]);
  };

  return (
    <View style={s.container}>
      {/* Filter chips */}
      <View style={s.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={s.empty}>No transactions found</Text>
        }
        renderItem={({ item: t }) => {
          const cat = getCategoryById(t.categoryId);
          return (
            <TouchableOpacity
              style={s.row}
              onLongPress={() => handleDelete(t.id)}
              activeOpacity={0.7}
            >
              <View style={[s.icon, { backgroundColor: cat.color + '33' }]}>
                <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.desc}>{t.description || cat.label}</Text>
                <Text style={s.meta}>
                  {cat.label} · {new Date(t.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[s.amount, { color: t.type === 'income' ? '#4CAF50' : '#FF5252' }]}>
                {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddTransaction')}>
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E2E' },
  filters:   { flexDirection: 'row', padding: 16, gap: 8 },
  chip:      {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#2D2D3F',
  },
  chipActive:     { backgroundColor: ACCENT },
  chipText:       { color: '#888', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  empty:  { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 14 },
  row:    {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2D2D3F', borderRadius: 14,
    padding: 14, marginBottom: 10,
  },
  icon:   { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info:   { flex: 1 },
  desc:   { color: '#fff', fontWeight: '500', fontSize: 14 },
  meta:   { color: '#666', fontSize: 12, marginTop: 3 },
  amount: { fontWeight: '700', fontSize: 15 },
  fab:    {
    position: 'absolute', right: 24, bottom: 24,
    backgroundColor: ACCENT, width: 56, height: 56,
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 10,
  },
  fabIcon: { color: '#fff', fontSize: 32, lineHeight: 36 },
});
