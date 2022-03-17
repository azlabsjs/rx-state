import { createSelector } from '../src';

describe('createSelector tests', () => {
  it('should run successfully', () => {
    const exampleState = {
      shop: {
        taxPercent: 8,
        items: [
          { name: 'apple', value: 1.2 },
          { name: 'orange', value: 0.95 },
        ],
      },
    };
    const selectShopItems = (state: typeof exampleState) => state.shop.items;
    const selectTaxPercent = (state: typeof exampleState) =>
      state.shop.taxPercent;
    const selectSubtotal = createSelector(selectShopItems, (items: any[]) =>
      items.reduce((subtotal, item) => subtotal + item.value, 0)
    );
    const selectTax = createSelector(
      selectSubtotal,
      selectTaxPercent,
      (subtotal: number, taxPercent: number) => subtotal * (taxPercent / 100)
    );
    const selectTotal = createSelector(
      selectSubtotal,
      selectTax,
      (subtotal: number, tax: number) => ({ total: subtotal + tax })
    );
    expect(selectSubtotal(exampleState)).toEqual(2.15);
    expect(selectTax(exampleState)).toEqual(0.172);
    expect(selectTotal(exampleState)).toEqual({ total: 2.322 });
  });
});
