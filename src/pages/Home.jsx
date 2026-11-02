import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone } from 'lucide-react';
import api, { getErrorMessage } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import FoodCard from '../components/food/FoodCard';
import FoodModal from '../components/food/FoodModal';
import Skeleton from '../components/common/Skeleton';

export default function Home() {
  const { settings } = useSettings();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/foods'), api.get('/categories')])
      .then(([foodRes, catRes]) => {
        setFoods(foodRes.data.data || []);
        setCategories(catRes.data.data || []);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const popular = foods.filter((f) => f.is_popular).slice(0, 4);
  const bestsellers = foods.filter((f) => f.is_bestseller).slice(0, 4);
  const specials = foods.filter((f) => f.is_special).slice(0, 4);

  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden bg-ink text-white">
        <img
          src={settings.hero_image || 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=80'}
          alt="Restaurant dishes"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="container-page relative flex min-h-[78vh] flex-col justify-center py-16">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-200">Indian kitchen</p>
          <h1 className="font-display max-w-xl text-5xl leading-tight md:text-7xl">{settings.restaurant_name}</h1>
          <p className="mt-4 max-w-lg text-lg text-stone-200">{settings.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">
              Order now
            </Link>
            <Link to="/about" className="rounded-full border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-8 md:grid-cols-3">
        <Info icon={<Phone size={18} />} label="Call" value={settings.phone} />
        <Info icon={<Clock size={18} />} label="Hours" value={settings.opening_hours} />
        <Info icon={<MapPin size={18} />} label="Find us" value={settings.address} />
      </section>

      {error && <p className="container-page text-red-700">{error}</p>}

      <section className="container-page py-8">
        <SectionHead title="Categories" to="/menu" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            : categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/menu?category=${category.slug}`}
                  className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-semibold">{category.name}</p>
                  <p className="mt-1 text-xs text-muted">{category.foods_count} dishes</p>
                </Link>
              ))}
        </div>
      </section>

      <FoodRow title="Popular right now" items={popular} loading={loading} onOpen={setSelected} />
      <FoodRow title="Best sellers" items={bestsellers} loading={loading} onOpen={setSelected} />
      <FoodRow title="Today's specials" items={specials} loading={loading} onOpen={setSelected} />

      <section className="container-page my-10 grid items-center gap-8 rounded-3xl bg-cream p-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl">A kitchen built on slow fire</h2>
          <p className="mt-4 text-muted">{settings.about}</p>
          <Link to="/about" className="mt-6 inline-block font-semibold text-brand">
            Read more
          </Link>
        </div>
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80"
          alt="Dining room"
          className="h-72 w-full rounded-2xl object-cover"
        />
      </section>
      <FoodModal food={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function SectionHead({ title, to }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="font-display text-3xl">{title}</h2>
      {to && (
        <Link to={to} className="text-sm font-semibold text-brand">
          View menu
        </Link>
      )}
    </div>
  );
}

function FoodRow({ title, items, loading, onOpen }) {
  return (
    <section className="container-page py-8">
      <SectionHead title={title} to="/menu" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72" />)
          : items.map((food) => <FoodCard key={food.id} food={food} onOpen={onOpen} />)}
      </div>
    </section>
  );
}
