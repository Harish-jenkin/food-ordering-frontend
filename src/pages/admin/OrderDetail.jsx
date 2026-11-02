import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatMoney } from '../../utils/format';

const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready', 'completed', 'cancelled'];

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/admin/orders/${id}`)
      .then((res) => {
        setOrder(res.data.data);
        setStatus(res.data.data.status);
      })
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [id, toast]);

  const saveStatus = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/orders/${id}/status`, { status });
      setOrder(data.data);
      toast.success('Order status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!order) return <p>Loading order…</p>;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/orders" className="text-sm text-brand">← All orders</Link>
      <h1 className="mt-3 font-display text-3xl">{order.order_number}</h1>
      <p className="mt-1 text-muted">{formatDate(order.created_at)}</p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <p className="font-semibold">{order.customer_name}</p>
        <p>{order.customer_mobile}</p>
        {order.customer_email && <p>{order.customer_email}</p>}
        <p className="mt-2 capitalize">{order.order_type} · {order.payment_method}</p>
        {order.delivery_address && <p className="mt-2">{order.delivery_address}{order.landmark ? `, ${order.landmark}` : ''}</p>}
        {order.preferred_time && <p className="mt-1 text-sm">Preferred time: {order.preferred_time}</p>}
        {order.instructions && <p className="mt-1 text-sm">Instructions: {order.instructions}</p>}
        <ul className="mt-6 space-y-2 border-t pt-4 text-sm">
          {order.items?.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatMoney(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{formatMoney(order.delivery_charge)}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd>{formatMoney(order.discount)}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{formatMoney(order.tax)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Grand total</dt><dd>{formatMoney(order.grand_total)}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border px-3 py-2">
            {statuses.map((value) => (
              <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>
            ))}
          </select>
          <button type="button" onClick={saveStatus} disabled={saving} className="rounded-full bg-brand px-4 py-2 font-semibold text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Update status'}
          </button>
        </div>
      </div>
    </div>
  );
}
