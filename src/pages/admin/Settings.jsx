import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const groups = [
  {
    title: 'Restaurant profile',
    fields: [
      ['restaurant_name', 'Restaurant name'],
      ['tagline', 'Tagline'],
      ['about', 'About', 'textarea'],
      ['phone', 'Phone'],
      ['email', 'Email'],
      ['address', 'Address', 'textarea'],
      ['opening_hours', 'Opening hours'],
      ['hero_image', 'Hero image URL'],
    ],
  },
  {
    title: 'Orders & WhatsApp',
    fields: [
      ['whatsapp_number', 'WhatsApp number (country code, digits only)'],
      ['upi_id', 'UPI ID for payment QR (e.g. spicehaven@upi)'],
      ['upi_name', 'UPI payee name'],
      ['delivery_charge', 'Delivery charge'],
      ['free_delivery_min', 'Free delivery minimum'],
      ['tax_percent', 'Tax percent'],
      ['discount_percent', 'Discount percent'],
      ['currency', 'Currency code'],
    ],
  },
];

export default function Settings() {
  const toast = useToast();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => setForm(res.data.data || {}))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [toast]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/admin/settings', form);
      setForm(data.data);
      toast.success('Settings saved. Customers will see the new WhatsApp number on the next load.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save settings.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Restaurant settings</h1>
        <p className="mt-1 text-sm text-muted">WhatsApp must include the country code with no plus sign, for example 919966738715.</p>
      </div>
      {groups.map((group) => (
        <section key={group.title} className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl">{group.title}</h2>
          {group.fields.map(([key, label, type]) => (
            <label key={key} className="block text-sm font-medium">
              {label}
              {type === 'textarea' ? (
                <textarea value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 min-h-24 w-full rounded-xl border px-3 py-2 font-normal" />
              ) : (
                <input value={form[key] || ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" />
              )}
            </label>
          ))}
        </section>
      ))}
      <button type="submit" disabled={saving} className="rounded-full bg-brand px-5 py-3 font-semibold text-white disabled:opacity-60">
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
