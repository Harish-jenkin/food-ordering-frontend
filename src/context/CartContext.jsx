import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'spicehaven_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const existing = state.find((item) => item.id === action.item.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.item.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case 'remove':
      return state.filter((item) => item.id !== action.id);
    case 'setQty':
      return state
        .map((item) => (item.id === action.id ? { ...item, quantity: action.quantity } : item))
        .filter((item) => item.quantity > 0);
    case 'replace':
      return action.items;
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      count,
      quantityOf: (id) => items.find((item) => item.id === id)?.quantity ?? 0,
      addItem: (item) => dispatch({ type: 'add', item }),
      removeItem: (id) => dispatch({ type: 'remove', id }),
      setQty: (id, quantity) => dispatch({ type: 'setQty', id, quantity }),
      replaceItems: (next) => dispatch({ type: 'replace', items: next }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
