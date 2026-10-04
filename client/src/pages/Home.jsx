import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import { CATEGORIES } from '../utils/format.js';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', sort: 'newest' });

  useEffect(() => {
    setLoading(true);
    api
      .get('/products', { params: { ...filters, page, limit: 12 } })
      .then(({ data }) => {
        if (data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        } else {
          setProducts(data);
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const update = (key) => (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  };

  return (
    <section>
      <div className="hero">
        <h1>Everything you need, in one sphere.</h1>
        <p className="muted">Electronics, fashion, books and more — delivered across India.</p>
      </div>

      <div className="filters">
        <input placeholder="Search products..." value={filters.search} onChange={update('search')} />
        <select value={filters.category} onChange={update('category')}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={filters.sort} onChange={update('sort')}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="muted">No products found.</p>
      ) : (
        <>
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="row" style={{ justifyContent: 'center', marginTop: '32px', gap: '12px' }}>
              <button
                className="btn btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span className="muted" style={{ alignSelf: 'center', fontSize: '0.95rem' }}>
                Page {page} of {totalPages} ({total} products)
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
