const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Both bestseller and date already exist on every product (backend
 * productModel.js) — this needs no backend change, just wiring the badge
 * ProductItem already renders but no caller ever passed.
 */
export const getProductBadge = (product, t) => {
  if (!product) return null;
  if (product.bestseller) return t('common:badges.bestseller');
  if (typeof product.date === 'number' && Date.now() - product.date < NEW_WINDOW_MS) {
    return t('common:badges.new');
  }
  return null;
};
