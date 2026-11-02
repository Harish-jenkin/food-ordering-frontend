import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { formatMoney } from '../../utils/format';

const emptyForm = {
  name: '',
  category_id: '',
  description: '',
  price: '',
  is_veg: true,
  is_available: true,
  is_popular: false,
  is_bestseller: false,
  is_special: false,
};

export default function Foods() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState('');
  const [veg, setVeg] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/foods', {
        params: {
          search: search || undefined,
          category_id: categoryId || undefined,
          available: available === '' ? undefined : available,
          is_veg: veg === '' ? undefined : veg,
          page,
        },
      })
      .then((res) => {
        setItems(res.data.data.items);
        setMeta(res.data.data.meta);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/admin/categories', { params: { per_page: 100 } }).then((res) => setCategories(res.data.data.items || []));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, available, veg]);

  const openCreate = () => {
    setEditing('new');
    setForm(emptyForm);
    setImage(null);
  };

  const openEdit = (food) => {
    setEditing(food);
    setForm({
      name: food.name,
      category_id: food.category_id,
      description: food.description || '',
      price: food.price,
      is_veg: food.is_veg,
      is_available: food.is_available,
      is_popular: food.is_popular,
      is_bestseller: food.is_bestseller,
      is_special: food.is_special,
    });
    setImage(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
    });
    if (image) payload.append('image', image);

    try {
      if (editing === 'new') {
        await api.post('/admin/foods', payload);
        toast.success('Food item created.');
      } else {
        await api.post(`/admin/foods/${editing.id}`, payload);
        toast.success('Food item updated.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not save the food item.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/admin/foods/${toDelete.id}`);
      toast.success('Food item deleted.');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleAvailable = async (food) => {
    try {
      const payload = new FormData();
      payload.append('is_available', food.is_available ? '0' : '1');
      await api.post(`/admin/foods/${food.id}`, payload);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Food items</h1>
          <p className="text-sm text-muted">{meta.total || 0} dishes · click Edit on a row to change the price. This is the only place menu prices are stored.</p>
        </div>
        <button type="button" onClick={openCreate} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add food
        </button>
      </div>
      <form
        className="mt-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          load();
        }}
      >
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes" className="rounded-xl border px-3 py-2 md:col-span-2" />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="rounded-xl border px-3 py-2">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select value={available} onChange={(e) => { setAvailable(e.target.value); setPage(1); }} className="rounded-xl border px-3 py-2">
          <option value="">All availability</option>
          <option value="1">Available</option>
          <option value="0">Hidden</option>
        </select>
        <select value={veg} onChange={(e) => { setVeg(e.target.value); setPage(1); }} className="rounded-xl border px-3 py-2">
          <option value="">Veg & non-veg</option>
          <option value="1">Vegetarian</option>
          <option value="0">Non-veg</option>
        </select>
        <button type="submit" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white md:col-span-5 md:w-fit">Apply filters</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Dish</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-4 py-6" colSpan={5}>Loading…</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td className="px-4 py-6 text-muted" colSpan={5}>No food items match these filters.</td></tr>
            )}
            {items.map((food) => (
              <tr key={food.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={food.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium">{food.name}</p>
                      <p className="text-xs text-muted">{food.category?.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{formatMoney(food.price)}</td>
                <td className="px-4 py-3">{food.is_veg ? 'Veg' : 'Non-veg'}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleAvailable(food)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${food.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}
                  >
                    {food.is_available ? 'On menu' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-3 text-brand" onClick={() => openEdit(food)}>Edit</button>
                  <button type="button" className="text-red-600" onClick={() => setToDelete(food)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={meta.current_page} lastPage={meta.last_page} onChange={setPage} />

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-6">
            <h2 className="font-display text-2xl">{editing === 'new' ? 'New dish' : 'Edit dish'}</h2>
            <label className="mt-4 block text-sm">Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm">Category
              <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2">
                <option value="">Select</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm">Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm">Price
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="mt-3 block text-sm">Image
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="mt-1 w-full text-sm" />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {[
                ['is_veg', 'Vegetarian'],
                ['is_available', 'Available'],
                ['is_popular', 'Popular'],
                ['is_bestseller', 'Best seller'],
                ['is_special', "Today's special"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-full bg-brand px-4 py-2 font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this dish?"
        message={`${toDelete?.name || ''} will be removed from the menu.`}
        confirmLabel="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}
