export const CATEGORIES = [
  { id: 'food',          label: 'Food & Dining',     icon: '🍔', color: '#FF6B6B' },
  { id: 'transport',     label: 'Transport',          icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping',      label: 'Shopping',           icon: '🛍️', color: '#45B7D1' },
  { id: 'entertainment', label: 'Entertainment',      icon: '🎬', color: '#96CEB4' },
  { id: 'health',        label: 'Health',             icon: '💊', color: '#FFEAA7' },
  { id: 'bills',         label: 'Bills & Utilities',  icon: '💡', color: '#DDA0DD' },
  { id: 'education',     label: 'Education',          icon: '📚', color: '#98D8C8' },
  { id: 'other',         label: 'Other',              icon: '📦', color: '#F7DC6F' },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[7];
