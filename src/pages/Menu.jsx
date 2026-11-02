import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import FoodCard from '../components/food/FoodCard';
import FoodModal from '../components/food/FoodModal';
import Skeleton from '../components/common/Skeleton';

export default function Menu() {
  const [params, setParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const [search, setSearch] = useState(params.get('q') || '');
  const [sort, setSort] = useState(params.get('sort') || '');
  const category = params.get('category') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data || []));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setError('');
    const query = { sort, search };
    if (category) query.category = category;
    api
      .get('/foods', { params: query })
      .then((res) => setFoods(res.data.data || []))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const heading = useMemo(() => {
    const match = categories.find((c) => c.slug === category);
    return match ? match.name : 'Full menu';
  }, [categories, category]);

  const updateCategory = (slug) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next);
  };

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-4xl">{heading}</h1>
      <p className="mt-2 text-muted">Filter by category, search a dish, or sort by price.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={!category} onClick={() => updateCategory('')}>
          All
        </FilterChip>
        {categories.map((item) => (
          <FilterChip key={item.id} active={category === item.slug} onClick={() => updateCategory(item.slug)}>
            {item.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_200px]">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search dishes"
          className="rounded-2xl border border-stone-200 bg-white px-4 py-3"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
          <option value="">Default</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {error && <p className="mt-6 text-red-700">{error}</p>}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
        {!loading && foods.length === 0 && (
          <div className="col-span-full rounded-3xl bg-white p-12 text-center text-muted">
            No dishes match this filter. Try another category or search term.
          </div>
        )}
        {!loading && foods.map((food) => <FoodCard key={food.id} food={food} onOpen={setSelected} />)}
      </div>
      <FoodModal food={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium ${active ? 'bg-brand text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200'}`}
    >
      {children}
    </button>
  );
}
