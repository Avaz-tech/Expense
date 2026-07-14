export const formatMoney = (amount: number | string) => {
  const value = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};
