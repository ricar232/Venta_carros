import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import CarCard from '../components/CarCard.jsx';
import { fetchCars, formatPrice } from '../lib/carsApi.js';

const ALL_TYPES = ['SUV', 'Sedán', 'Pickup', 'Deportivo', 'Eléctrico'];
const TRANSMISSIONS = ['Automática', 'Manual'];
const emptyFilters = { types: [], make: '', maxPrice: 95000, minYear: 2018, transmissions: [], onlyVerified: false };

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [carsLoaded, setCarsLoaded] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    const typeParam = searchParams.get('type');
    fetchCars().then((raw) => {
      const withFmt = raw.map((c) => ({
        ...c,
        priceFmt: formatPrice(c.price),
        mileageFmt: Number(c.mileage || 0).toLocaleString('en-US'),
      }));
      setCars(withFmt);
      setCarsLoaded(true);
      if (typeParam) setFilters((f) => ({ ...f, types: [typeParam] }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleType(type) {
    setFilters((f) => {
      const has = f.types.includes(type);
      return { ...f, types: has ? f.types.filter((t) => t !== type) : [...f.types, type] };
    });
  }

  function toggleTransmission(tr) {
    setFilters((f) => {
      const has = f.transmissions.includes(tr);
      return { ...f, transmissions: has ? f.transmissions.filter((t) => t !== tr) : [...f.transmissions, tr] };
    });
  }

  const filteredCars = useMemo(() => {
    let list = cars.filter((c) => {
      if (filters.types.length && !filters.types.includes(c.type)) return false;
      if (filters.make && c.make !== filters.make) return false;
      if (c.price > filters.maxPrice) return false;
      if (c.year < filters.minYear) return false;
      if (filters.transmissions.length && !filters.transmissions.includes(c.transmission)) return false;
      if (filters.onlyVerified && !c.verified) return false;
      return true;
    });
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'year-desc') list = [...list].sort((a, b) => b.year - a.year);
    else if (sort === 'mileage-asc') list = [...list].sort((a, b) => a.mileage - b.mileage);
    return list;
  }, [cars, filters, sort]);

  const makeOptions = useMemo(() => [...new Set(cars.map((c) => c.make))].sort(), [cars]);
  const hasActiveFilters =
    filters.types.length > 0 || !!filters.make || filters.maxPrice < 95000 || filters.minYear > 2018 || filters.transmissions.length > 0 || filters.onlyVerified;
  const hasResults = filteredCars.length > 0;
  const noResults = carsLoaded && cars.length > 0 && filteredCars.length === 0;
  const noCarsAtAll = carsLoaded && cars.length === 0;
  const resultsCount = carsLoaded ? filteredCars.length : '—';

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif", background: 'oklch(0.16 0.014 30)', color: 'oklch(0.97 0.008 30)', minHeight: '100vh' }}>
      <Navbar active="catalogo" />

      <header style={{ maxWidth: 1400, margin: '0 auto', padding: '44px 32px 24px' }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 42, margin: '0 0 8px' }}>Catálogo de autos</h1>
        <p style={{ fontSize: 15.5, color: 'oklch(0.68 0.015 30)', margin: 0 }}>{resultsCount} anuncios encontrados</p>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 100px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'flex-start' }}>
        <aside
          style={{
            position: 'sticky',
            top: 94,
            background: 'oklch(0.21 0.016 30 / 0.55)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            borderRadius: 20,
            padding: 26,
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontFamily: "'Instrument Serif', serif", fontSize: 20 }}>Filtros</h3>
            <button
              type="button"
              onClick={() => setFilters(emptyFilters)}
              style={{ background: 'none', border: 'none', color: 'oklch(0.72 0.17 55)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Limpiar
            </button>
          </div>

          <div>
            <p style={filterLabelStyle}>Tipo</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {ALL_TYPES.map((t) => {
                const active = filters.types.includes(t);
                const count = cars.filter((c) => c.type === t).length;
                return (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer', color: active ? 'oklch(0.97 0.008 30)' : 'oklch(0.72 0.015 30)' }}>
                    <input type="checkbox" checked={active} onChange={() => toggleType(t)} style={{ accentColor: 'oklch(0.72 0.17 55)', width: 16, height: 16 }} />
                    {t} <span style={{ color: 'oklch(0.5 0.015 30)', fontSize: 12.5 }}>({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p style={filterLabelStyle}>Marca</p>
            <select
              value={filters.make}
              onChange={(e) => setFilters((f) => ({ ...f, make: e.target.value }))}
              style={selectStyle}
            >
              <option value="">Todas las marcas</option>
              {makeOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p style={filterLabelStyle}>Precio máximo</p>
            <input
              type="range"
              min={15000}
              max={95000}
              step={1000}
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: 13.5, color: 'oklch(0.85 0.01 30)', margin: '8px 0 0', fontWeight: 700 }}>Hasta ${filters.maxPrice.toLocaleString('en-US')}</p>
          </div>

          <div>
            <p style={filterLabelStyle}>Año mínimo</p>
            <input
              type="range"
              min={2018}
              max={2024}
              step={1}
              value={filters.minYear}
              onChange={(e) => setFilters((f) => ({ ...f, minYear: Number(e.target.value) }))}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: 13.5, color: 'oklch(0.85 0.01 30)', margin: '8px 0 0', fontWeight: 700 }}>{filters.minYear} en adelante</p>
          </div>

          <div>
            <p style={filterLabelStyle}>Transmisión</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {TRANSMISSIONS.map((t) => {
                const active = filters.transmissions.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTransmission(t)}
                    style={{
                      flex: 1,
                      padding: 9,
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: `1px solid ${active ? 'oklch(0.72 0.17 55)' : 'oklch(1 0 0 / 0.12)'}`,
                      background: active ? 'oklch(0.72 0.17 55 / 0.18)' : 'transparent',
                      color: active ? 'oklch(0.85 0.13 55)' : 'oklch(0.75 0.015 30)',
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer', paddingTop: 6, borderTop: '1px solid oklch(1 0 0 / 0.08)' }}>
            <input
              type="checkbox"
              checked={filters.onlyVerified}
              onChange={() => setFilters((f) => ({ ...f, onlyVerified: !f.onlyVerified }))}
              style={{ accentColor: 'oklch(0.72 0.17 55)', width: 16, height: 16 }}
            />
            Solo vendedores verificados
          </label>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setFilters(emptyFilters)}
                  style={{
                    background: 'oklch(0.72 0.17 55 / 0.15)',
                    border: '1px solid oklch(0.72 0.17 55 / 0.4)',
                    color: 'oklch(0.85 0.13 55)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: 100,
                    cursor: 'pointer',
                  }}
                >
                  ✕ Limpiar filtros
                </button>
              )}
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ ...selectStyle, width: 'auto', background: 'oklch(0.21 0.016 30)', color: 'oklch(0.9 0.01 30)', fontSize: 13.5, padding: '9px 14px' }}>
              <option value="recent">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="year-desc">Año: más nuevo</option>
              <option value="mileage-asc">Menor kilometraje</option>
            </select>
          </div>

          {hasResults && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
          {noResults && (
            <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed oklch(1 0 0 / 0.15)', borderRadius: 20 }}>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, margin: '0 0 8px' }}>Sin resultados</p>
              <p style={{ fontSize: 14.5, color: 'oklch(0.65 0.015 30)', margin: '0 0 20px' }}>Ajusta los filtros para ver más anuncios.</p>
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                style={{
                  background: 'linear-gradient(135deg, oklch(0.63 0.20 25), oklch(0.72 0.17 55))',
                  border: 'none',
                  color: 'oklch(0.14 0.012 30)',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px 24px',
                  borderRadius: 100,
                  cursor: 'pointer',
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
          {noCarsAtAll && (
            <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed oklch(1 0 0 / 0.15)', borderRadius: 20 }}>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, margin: '0 0 8px' }}>Aún no hay anuncios</p>
              <p style={{ fontSize: 14.5, color: 'oklch(0.65 0.015 30)', margin: 0 }}>
                Corre <code>npm run seed</code> o publica anuncios para que el catálogo se llene con datos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const filterLabelStyle = { fontSize: 13, fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '.04em', color: 'oklch(0.68 0.015 30)' };

const selectStyle = {
  width: '100%',
  background: 'oklch(0.16 0.014 30)',
  border: '1px solid oklch(1 0 0 / 0.12)',
  color: 'oklch(0.95 0.008 30)',
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  padding: '10px 12px',
  borderRadius: 10,
};
