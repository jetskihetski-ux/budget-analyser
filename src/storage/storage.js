import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  transactions: '@ba_transactions',
  budgets:      '@ba_budgets',
};

export async function getTransactions() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.transactions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTransaction(transaction) {
  const list = await getTransactions();
  const updated = [transaction, ...list];
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(updated));
  return updated;
}

export async function deleteTransaction(id) {
  const list = await getTransactions();
  const updated = list.filter((t) => t.id !== id);
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(updated));
  return updated;
}

export async function getBudgets() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.budgets);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveBudget(categoryId, amount) {
  const budgets = await getBudgets();
  budgets[categoryId] = amount;
  await AsyncStorage.setItem(KEYS.budgets, JSON.stringify(budgets));
  return budgets;
}
