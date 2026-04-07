import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { saveTransaction } from '../storage/storage';
import { CATEGORIES } from '../constants/categories';

const ACCENT = '#6C63FF';

export default function AddTransactionScreen({ navigation }) {
  const [type,        setType]        = useState('expense');
  const [amount,      setAmount]      = useState('');
  const [categoryId,  setCategoryId]  = useState('food');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount greater than 0.');
      return;
    }

    const transaction = {
      id:          Date.now().toString(),
      type,
      amount:      num,
      categoryId:  type === 'income' ? 'other' : categoryId,
      description: description.trim(),
      date:        new Date().toISOString(),
    };

    await saveTransaction(transaction);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Type toggle */}
        <View style={s.toggle}>
          {['expense', 'income'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.toggleBtn, type === t && s.toggleActive(t)]}
              onPress={() => setType(t)}
            >
              <Text style={[s.toggleText, type === t && s.toggleTextActive]}>
                {t === 'expense' ? '↑ Expense' : '↓ Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={s.label}>Amount</Text>
        <View style={s.amountWrap}>
          <Text style={s.currency}>$</Text>
          <TextInput
            style={s.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#444"
          />
        </View>

        {/* Category (expenses only) */}
        {type === 'expense' && (
          <>
            <Text style={s.label}>Category</Text>
            <View style={s.categories}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    s.catChip,
                    { borderColor: cat.color },
                    categoryId === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={s.catIcon}>{cat.icon}</Text>
                  <Text style={[s.catLabel, categoryId === cat.id && { color: '#111' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Description */}
        <Text style={s.label}>Note (optional)</Text>
        <TextInput
          style={s.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What was this for?"
          placeholderTextColor="#444"
          maxLength={80}
        />

        {/* Save */}
        <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
          <Text style={s.saveBtnText}>Save Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#1E1E2E' },
  toggle:          {
    flexDirection: 'row', backgroundColor: '#2D2D3F',
    borderRadius: 14, padding: 4, marginBottom: 24,
  },
  toggleBtn:       { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toggleActive:    (t) => ({ backgroundColor: t === 'expense' ? '#FF5252' : '#4CAF50' }),
  toggleText:      { color: '#666', fontWeight: '600' },
  toggleTextActive:{ color: '#fff' },
  label:           { color: '#888', fontSize: 13, marginBottom: 8, marginTop: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  amountWrap:      {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2D2D3F', borderRadius: 14, paddingHorizontal: 16,
  },
  currency:        { color: '#fff', fontSize: 24, marginRight: 8 },
  amountInput:     { flex: 1, color: '#fff', fontSize: 32, fontWeight: '700', paddingVertical: 16 },
  categories:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catChip:         {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  catIcon:         { fontSize: 16 },
  catLabel:        { color: '#ccc', fontSize: 13 },
  input:           {
    backgroundColor: '#2D2D3F', borderRadius: 14,
    padding: 16, color: '#fff', fontSize: 15,
  },
  saveBtn:         {
    backgroundColor: ACCENT, borderRadius: 16,
    padding: 18, alignItems: 'center', marginTop: 36,
  },
  saveBtnText:     { color: '#fff', fontWeight: '700', fontSize: 16 },
});
