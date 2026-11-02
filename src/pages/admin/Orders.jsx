import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatMoney } from '../../utils/format';

const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready', 'completed', 'cancelled'];

const statusStyles = {
  pending: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-sky-50 text-sky-800',
  preparing: 'bg-orange-50 text-orange-800',
  out_for_delivery: 'bg-indigo-50 text-indigo-800',
  ready: 'bg-emerald-50 text-emerald-800',
  completed: 'bg-stone-100 text-stone-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function Orders() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', order_type: '', from: '', to: '' });
  const [loading, setLoading] = useState(true);

  const load = (nextPage = page, nextFilters = filters) => {
    setLoading(true);
    api
      .get('/admin/orders', { params: { page: nextPage, ...nextFilters } })
      .then((res) => {
        setItems(res.data.data.items);
        setMeta(res.data.data.meta);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const changeFilter = (field, value) => {
    const next = { ...filters, [field]: value };
    setFilters(next);
    setPage(1);
    load(1, next);
  };

  const updateStatus = async (order, status) => {
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status });
      toast.success(`${order.order_number} marked ${status.replaceAll('_', ' ')}.`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="text-sm text-muted">{meta.total || 0} matching tickets</p>
        </div>
      </div>
      <form
        className="mt-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          load(1, filters);
        }}
      >
        <input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search name, mobile, order #"
          className="rounded-xl border px-3 py-2 md:col-span-2"
        />
        <select value={filters.status} onChange={(e) => changeFilter('status', e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
          ))}
        </select>
        <select value={filters.order_type} onChange={(e) => changeFilter('order_type', e.target.value)} className="rounded-xl border px-3 py-2">
          <option value="">Delivery & takeaway</option>
          <option value="delivery">Delivery</option>
          <option value="takeaway">Takeaway</option>
        </select>
        <input type="date" value={filters.from} onChange={(e) => changeFilter('from', e.target.value)} className="rounded-xl border px-3 py-2" />
        <input type="date" value={filters.to} onChange={(e) => changeFilter('to', e.target.value)} className="rounded-xl border px-3 py-2" />
        <button type="submit" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white md:col-span-6 md:w-fit">Apply filters</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-4 py-8 text-muted" colSpan={6}>Loading orders…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td className="px-4 py-8 text-muted" colSpan={6}>No orders match these filters.</td></tr>
            )}
            {items.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="px-4 py-3">
                  <Link className="font-medium text-brand" to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
                </td>
                <td className="px-4 py-3">
                  {order.customer_name}
                  <p className="text-xs text-muted">{order.customer_mobile}</p>
                </td>
                <td className="px-4 py-3 capitalize">{order.order_type}</td>
                <td className="px-4 py-3">{formatMoney(order.grand_total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order, e.target.value)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status] || 'bg-stone-100'}`}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">{formatDate(order.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={meta.current_page} lastPage={meta.last_page} onChange={setPage} />
    </div>
  );
}
