export const formatPrice = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
};

export const generateOrderId = () =>
  'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

export const maskCard = (num) =>
  num.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();

export const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').substring(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

export const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').substring(0, 4);
  if (digits.length >= 3) return digits.substring(0, 2) + '/' + digits.substring(2);
  return digits;
};
