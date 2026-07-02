export const formatDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  } catch (e) {
    return dateStr;
  }
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};
