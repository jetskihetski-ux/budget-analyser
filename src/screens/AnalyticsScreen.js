import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions } from '../storage/storage';
import { CATEGORIES, getCategoryById } from '../constants/categories';

const { width } = Dimensions.get('window');
const ACCENT    = '#6C63FF';

export default function AnalyticsScreen() {
  const [transactions, setTransactions] = useState([]);

  useFocusEffect(
    useCallback(() => { getTransactions().then(setTransactions); }, [])
  );

  const now   = new Date();
  const month = now.getMonth();
  const year  = now.getFullYear();

  // This month's expenses by category
  const thisMonthExp = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === month && d.getFullYear() === year;
  });

  const byCategory = {};
  thisMonthExp.forEach((t) => {
    byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + t.amount;
  });

  const totalExp  = Object.values(byCategory).reduce((s, v) => s + v, 0);
  const catSorted = CATEGORIES
    .map((c) => ({ ...c, spent: byCategory[c.id] ?? 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent);

  // Last 6 months spending
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(year, month - (5 - i), 1);
    const m    = d.getMonth();
    const y    = d.getFullYear();
    const name = d.toLocaleString('default', { month: 'short' });
    const total = transactions
      .filter((t) => {
        const td = new Date(t.date);
        return t.type === 'expense' && td.getMonth() === m && td.getFullYear() === y;
      })
      .reduce((s, t) => s + t.amount, 0);
    return { name, total };
  });

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Summary */}
      <View style={s.summaryCard}>
        <Text style={s.summaryLabel}>This Month's Spending</Text>
        <Text style={s.summaryTotal}>${totalExp.toFixed(2)}</Text>
      </View>

      {/* Monthly trend */}
      <Text style={s.sectionTitle}>6-Month Trend</Text>
      <View style={s.chartCard}>
        <View style={s.barChart}>
          {monthlyData.map((m, i) => {
            const h = m.total > 0 ? Math.max((m.total / maxMonthly) * 120, 6) : 4;
            const isCurrentMonth = i === 5;
            return (
              <View key={i} style={s.barCol}>
                <Text style={s.barValue}>
                  {m.total > 0 ? `$${m.total >= 1000 ? (m.total / 1000).toFixed(1) + 'k' : m.total.toFixed(0)}` : ''}
                </Text>
                <View
                  style={[
                    s.bar,
                    { height: h, backgroundColor: isCurrentMonth ? ACCENT : '#3D3D55' },
                  ]}
                />
                <Text style={[s.barLabel, isCurrentMonth && { color: ACCENT }]}>{m.name}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category breakdown */}
      <Text style={s.sectionTitle}>By Category</Text>
      {catSorted.length === 0
        ? <Text style={s.empty}>No expenses this month</Text>
        : catSorted.map((cat) => {
            const pct = totalExp > 0 ? cat.spent / totalExp : 0;
            return (
              <View key={cat.id} style={s.catRow}>
                <View style={[s.catIcon, { backgroundColor: cat.color + '33' }]}>
                  <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                </View>
                <View style={s.catData}>
                  <View style={s.catHeader}>
                    <Text style={s.catName}>{cat.label}</Text>
                    <Text style={s.catAmt}>${cat.spent.toFixed(2)}</Text>
                  </View>
                  <View style={s.progressBg}>
                    <View style={[s.progressFill, { width: `${pct * 100}%`, backgroundColor: cat.color }]} />
                  </View>
                  <Text style={s.catPct}>{(pct * 100).toFixed(1)}% of total</Text>
                </View>
              </View>
            );
          })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#1E1E2E' },
  summaryCard:  {
    backgroundColor: ACCENT, borderRadius: 20,
    padding: 24, marginBottom: 24, alignItems: 'center',
  },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  summaryTotal: { color: '#fff', fontSize: 38, fontWeight: '800', marginTop: 4 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '600', marginBottom: 14 },
  chartCard:    { backgroundColor: '#2D2D3F', borderRadius: 18, padding: 20, marginBottom: 24 },
  barChart:     { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 160 },
  barCol:       { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue:     { color: '#888', fontSize: 9, marginBottom: 4, textAlign: 'center' },
  bar:          { width: 28, borderRadius: 6 },
  barLabel:     { color: '#666', fontSize: 11, marginTop: 8 },
  catRow:       { flexDirection: 'row', marginBottom: 18 },
  catIcon:      { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  catData:      { flex: 1 },
  catHeader:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName:      { color: '#fff', fontWeight: '500', fontSize: 14 },
  catAmt:       { color: '#fff', fontWeight: '700', fontSize: 14 },
  progressBg:   { height: 6, backgroundColor: '#2D2D3F', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  catPct:       { color: '#555', fontSize: 11, marginTop: 5 },
  empty:        { color: '#555', textAlign: 'center', marginTop: 40 },
});
