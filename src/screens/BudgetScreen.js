import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, Modal, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, getBudgets, saveBudget } from '../storage/storage';
import { CATEGORIES } from '../constants/categories';

const ACCENT = '#6C63FF';

export default function BudgetScreen() {
  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState({});
  const [editing,      setEditing]      = useState(null); // category id
  const [inputValue,   setInputValue]   = useState('');

  useFocusEffect(
    useCallback(() => {
      getTransactions().then(setTransactions);
      getBudgets().then(setBudgets);
    }, [])
  );

  const now       = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      t.type === 'expense' &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  const spentByCategory = {};
  thisMonth.forEach((t) => {
    spentByCategory[t.categoryId] = (spentByCategory[t.categoryId] ?? 0) + t.amount;
  });

  const handleSaveBudget = async () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) {
      Alert.alert('Invalid', 'Enter a valid budget amount.');
      return;
    }
    const updated = await saveBudget(editing, num);
    setBudgets(updated);
    setEditing(null);
  };

  return (
    <View style={s.container}>
      <Text style={s.hint}>Tap a category to set a monthly budget limit</Text>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: cat }) => {
          const spent  = spentByCategory[cat.id] ?? 0;
          const limit  = budgets[cat.id] ?? 0;
          const pct    = limit > 0 ? Math.min(spent / limit, 1) : 0;
          const over   = limit > 0 && spent > limit;

          return (
            <TouchableOpacity
              style={s.card}
              onPress={() => { setEditing(cat.id); setInputValue(limit ? String(limit) : ''); }}
            >
              <View style={s.cardHeader}>
                <View style={[s.iconBox, { backgroundColor: cat.color + '33' }]}>
                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.catName}>{cat.label}</Text>
                  <Text style={s.spent}>
                    ${spent.toFixed(2)}
                    {limit > 0 && (
                      <Text style={{ color: over ? '#FF5252' : '#888' }}>
                        {' '}/ ${limit.toFixed(2)}
                      </Text>
                    )}
                  </Text>
                </View>
                {limit === 0 && <Text style={s.setBtn}>Set</Text>}
              </View>

              {limit > 0 && (
                <View style={s.barBg}>
                  <View
                    style={[
                      s.barFill,
                      { width: `${pct * 100}%`, backgroundColor: over ? '#FF5252' : cat.color },
                    ]}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Edit modal */}
      <Modal visible={!!editing} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>
              Set Budget — {CATEGORIES.find((c) => c.id === editing)?.label}
            </Text>
            <TextInput
              style={s.modalInput}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="decimal-pad"
              placeholder="Monthly limit ($)"
              placeholderTextColor="#555"
              autoFocus
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(null)}>
                <Text style={{ color: '#888', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmBtn} onPress={handleSaveBudget}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#1E1E2E' },
  hint:       { color: '#555', textAlign: 'center', paddingTop: 16, fontSize: 13 },
  card:       { backgroundColor: '#2D2D3F', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox:    { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardInfo:   { flex: 1 },
  catName:    { color: '#fff', fontWeight: '600', fontSize: 15 },
  spent:      { color: '#888', fontSize: 13, marginTop: 2 },
  setBtn:     { color: ACCENT, fontWeight: '600', fontSize: 13 },
  barBg:      { height: 6, backgroundColor: '#1E1E2E', borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  barFill:    { height: '100%', borderRadius: 3 },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:      { backgroundColor: '#2D2D3F', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#1E1E2E', borderRadius: 12,
    padding: 16, color: '#fff', fontSize: 18, marginBottom: 20,
  },
  modalBtns:  { flexDirection: 'row', gap: 12 },
  cancelBtn:  { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#1E1E2E', alignItems: 'center' },
  confirmBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: ACCENT, alignItems: 'center' },
});
