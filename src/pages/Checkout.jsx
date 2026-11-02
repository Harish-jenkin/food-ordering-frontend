import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, Clock, CreditCard, Landmark, Mail, MapPin, MessageSquare, Phone, ShoppingBag, User, Wallet } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../services/api';
import { formatMoney } from '../utils/format';
import { estimateTotals } from '../utils/cartTotals';
import { buildWhatsAppMessage, buildWhatsAppUrl, openWhatsApp } from '../utils/whatsapp';
import { buildPreferredTimeOptions } from '../utils/timeSlots';
import PaymentQr from '../components/checkout/PaymentQr';

const FORM_KEY = 'checkout_form';

const emptyForm = {
  customer_name: '',
  customer_mobile: '',
  customer_email: '',
  order_type: 'delivery',
  delivery_address: '',
  landmark: '',
  preferred_time: 'ASAP',
  instructions: '',
  payment_method: 'upi',
};

function loadSavedForm() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(FORM_KEY) || 'null');
    return saved ? { ...emptyForm, ...saved } : emptyForm;
  } catch {
    return emptyForm;
  }
}

const payments = [
  { value: 'upi', label: 'UPI', hint: 'Scan QR with GPay, PhonePe, Paytm', icon: Phone },
  { value: 'card', label: 'Card', hint: 'Pay by card through your UPI app', icon: CreditCard },
  { value: 'cash', label: 'Cash', hint: 'Pay on delivery or pickup, or scan now', icon: Wallet },
];

export default function Checkout() {
  const { items, replaceItems, clear } = useCart();
  const { settings } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(loadSavedForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [revalidating, setRevalidating] = useState(true);

  const timeOptions = useMemo(
    () => buildPreferredTimeOptions(settings.opening_hours),
    [settings.opening_hours],
  );

  useEffect(() => {
    sessionStorage.setItem(FORM_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((item) => item.id).join(',');
    setRevalidating(true);
    api
      .get('/foods', { params: { ids, available_only: false } })
      .then((res) => {
        const latest = res.data.data || [];
        const next = [];
        let removed = 0;
        items.forEach((item) => {
          const current = latest.find((food) => food.id === item.id);
          if (!current || !current.is_available) {
            removed += 1;
            return;
          }
          next.push({
            ...item,
            name: current.name,
            price: current.price,
            image_url: current.image_url,
            is_veg: current.is_veg,
          });
        });
        replaceItems(next);
        if (removed) toast.info('Some items were removed because they are no longer available.');
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setRevalidating(false));
    // Revalidate once when arriving at checkout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0 && !revalidating) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl">Nothing to check out</h1>
        <Link to="/menu" className="mt-4 inline-block text-brand">
          Return to menu
        </Link>
      </div>
    );
  }

  const { subtotal, delivery, discount, tax, total } = estimateTotals(items, settings, form.order_type);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const validate = () => {
    const next = {};
    if (!form.customer_name.trim()) next.customer_name = 'Name is required.';
    if (!/^[0-9+\-\s]{8,20}$/.test(form.customer_mobile)) next.customer_mobile = 'Enter a valid mobile number.';
    if (form.customer_email && !/^\S+@\S+\.\S+$/.test(form.customer_email)) next.customer_email = 'Enter a valid email.';
    if (form.order_type === 'delivery' && !form.delivery_address.trim()) next.delivery_address = 'Delivery address is required.';
    if (!form.preferred_time) next.preferred_time = 'Choose a preferred time.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    const idempotencyKey = sessionStorage.getItem('checkout_idempotency') || crypto.randomUUID();
    sessionStorage.setItem('checkout_idempotency', idempotencyKey);

    try {
      const { data } = await api.post('/orders', {
        items: items.map((item) => ({ food_item_id: item.id, quantity: item.quantity })),
        ...form,
        customer_email: form.customer_email || null,
        idempotency_key: idempotencyKey,
      });
      const order = data.data.order;
      const phone = data.data.whatsapp_number;
      const message = buildWhatsAppMessage(order);
      const url = buildWhatsAppUrl(phone, message);
      sessionStorage.removeItem('checkout_idempotency');
      sessionStorage.removeItem(FORM_KEY);
      sessionStorage.removeItem('checkout_qr_scanned');
      sessionStorage.removeItem('checkout_qr_left_page');
      sessionStorage.setItem('last_order', JSON.stringify({ order, whatsapp_number: phone, whatsapp_url: url }));
      clear();
      if (!openWhatsApp(url)) {
        toast.info('WhatsApp did not open automatically. Use the button on the next page.');
        navigate(`/order/${order.order_number}`, { state: { order, whatsapp_url: url } });
      }
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      toast.error(getErrorMessage(err, 'Could not create the order.'));
      setSubmitting(false);
    }
  };

  const groupedTimes = timeOptions.reduce((groups, option) => {
    const group = option.group || 'Times';
    if (!groups[group]) groups[group] = [];
    groups[group].push(option);
    return groups;
  }, {});

  return (
    <div className="bg-[radial-gradient(circle_at_top,_#fff4e8,_transparent_42%)]">
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={submit} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_rgba(28,25,23,0.08)] ring-1 ring-stone-100">
          <div className="bg-gradient-to-r from-brand to-orange-400 px-6 py-7 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-100">Almost there</p>
            <h1 className="font-display mt-1 text-4xl">Checkout</h1>
            <p className="mt-2 max-w-md text-sm text-orange-50">Tell us where to send it. Scan the payment QR, then WhatsApp opens with your saved order.</p>
          </div>

          <div className="space-y-8 p-6 md:p-8">
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">How would you like it?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: 'delivery', title: 'Home delivery', hint: 'We bring it to your door', icon: Bike },
                  { value: 'takeaway', title: 'Takeaway', hint: 'Pick it up from the kitchen', icon: ShoppingBag },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, order_type: option.value }))}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                      form.order_type === option.value
                        ? 'border-brand bg-orange-50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className={`rounded-xl p-2 ${form.order_type === option.value ? 'bg-brand text-white' : 'bg-cream text-brand'}`}>
                      <option.icon size={18} />
                    </span>
                    <span>
                      <span className="block font-semibold">{option.title}</span>
                      <span className="text-sm text-muted">{option.hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Your details</h2>
              <Field icon={User} label="Full name" error={errors.customer_name}>
                <input required value={form.customer_name} onChange={update('customer_name')} placeholder="Harish" />
              </Field>
              <Field icon={Phone} label="Mobile number" error={errors.customer_mobile}>
                <input required value={form.customer_mobile} onChange={update('customer_mobile')} placeholder="99667 38715" />
              </Field>
              <Field icon={Mail} label="Email (optional)" error={errors.customer_email}>
                <input type="email" value={form.customer_email} onChange={update('customer_email')} placeholder="you@email.com" />
              </Field>
            </section>

            {form.order_type === 'delivery' && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Delivery</h2>
                <Field icon={MapPin} label="Delivery address" error={errors.delivery_address}>
                  <textarea required value={form.delivery_address} onChange={update('delivery_address')} placeholder="House / street / area" className="min-h-24" />
                </Field>
                <Field icon={Landmark} label="Landmark">
                  <input value={form.landmark} onChange={update('landmark')} placeholder="Near the park, opposite bakery" />
                </Field>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Kitchen notes</h2>
              <Field icon={Clock} label="Preferred time" error={errors.preferred_time}>
                <select value={form.preferred_time} onChange={update('preferred_time')}>
                  {Object.entries(groupedTimes).map(([group, options]) => (
                    <optgroup key={group} label={group}>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {group === 'Tomorrow' ? `Tomorrow · ${option.label}` : option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field icon={MessageSquare} label="Additional instructions">
                <textarea value={form.instructions} onChange={update('instructions')} placeholder="Less spicy, extra raita, doorbell not working…" className="min-h-20" />
              </Field>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Payment</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {payments.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, payment_method: option.value }))}
                    className={`rounded-2xl border p-4 text-left ${
                      form.payment_method === option.value ? 'border-brand bg-orange-50' : 'border-stone-200'
                    }`}
                  >
                    <option.icon size={18} className="mb-2 text-brand" />
                    <span className="block font-semibold">{option.label}</span>
                    <span className="text-xs text-muted">{option.hint}</span>
                  </button>
                ))}
              </div>
              <PaymentQr settings={settings} amount={total} method={form.payment_method} />
            </section>

            <button
              type="submit"
              disabled={submitting || revalidating}
              className="w-full rounded-full bg-[#25D366] py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-[#1fb85a] disabled:opacity-60"
            >
              {submitting ? 'Saving order…' : 'Place order via WhatsApp'}
            </button>
          </div>
        </form>

        <aside className="h-fit overflow-hidden rounded-[2rem] bg-ink p-6 text-cream shadow-xl lg:sticky lg:top-24">
          <h2 className="font-display text-2xl text-white">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <img src={item.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  <span>
                    <span className="block text-white">{item.name}</span>
                    <span className="text-stone-400">× {item.quantity}</span>
                  </span>
                </span>
                <span>{formatMoney(Number(item.price) * item.quantity, settings.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
            <p className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal, settings.currency)}</span></p>
            <p className="flex justify-between"><span>Delivery</span><span>{formatMoney(delivery, settings.currency)}</span></p>
            <p className="flex justify-between"><span>Discount</span><span>{formatMoney(discount, settings.currency)}</span></p>
            <p className="flex justify-between"><span>Tax</span><span>{formatMoney(tax, settings.currency)}</span></p>
            <p className="flex justify-between text-lg font-semibold text-white"><span>Estimated total</span><span>{formatMoney(total, settings.currency)}</span></p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <span className="field-shell">
        <Icon size={18} className="shrink-0 text-brand" />
        {children}
      </span>
      {error && <span className="mt-1 block text-xs text-red-600">{Array.isArray(error) ? error[0] : error}</span>}
    </label>
  );
}
