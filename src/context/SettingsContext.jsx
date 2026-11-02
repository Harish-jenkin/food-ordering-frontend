import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api';

const SettingsContext = createContext(null);

const defaults = {
  restaurant_name: 'Spice Haven',
  tagline: '',
  about: '',
  phone: '',
  email: '',
  address: '',
  opening_hours: '',
  whatsapp_number: '',
  upi_id: '',
  upi_name: '',
  delivery_charge: '0',
  free_delivery_min: '0',
  tax_percent: '0',
  discount_percent: '0',
  currency: 'INR',
  hero_image: '',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api
      .get('/settings')
      .then((res) => {
        if (mounted) setSettings({ ...defaults, ...res.data.data });
      })
      .catch((err) => {
        if (mounted) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ settings, loading, error }), [settings, loading, error]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
