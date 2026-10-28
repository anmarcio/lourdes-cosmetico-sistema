import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Store, Search, MessageCircle, X } from 'lucide-react';
import './styles.css';

type Product = {
  id: number;
  name: string;
  description?: string | null;
  category: string | null;
  price: number | string;
  image_url?: string | null;
  available: boolean;
};

const API = import.meta.env.VITE_API_URL || 'https://lourdes-vitrine-api.onrender.com/api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('Todos');
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const brands = [
    'Todos',
    'Avon',
    'O Boticário',
    'Eudora',
    'Natura',
    'Diversos',
    'Cestas de Presentes',
  ];

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API}/public/products`);
        if (!response.ok) throw new Error('Não foi possível carregar os produtos.');
        const data = await response.json();
        setProducts(data);
      } catch {
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    async function loadWhatsApp() {
      try {
        const response = await fetch(`${API}/public/whatsapp`);
        if (!response.ok) return;
        const data = await response.json();
        setPhone(data.phone || '');
      } catch {
        setPhone('');
      }
    }

    load();
    loadWhatsApp();
  }, []);

  const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
    const category = String(product.category || '').trim().toLowerCase();

    const matchesBrand =
      brand === 'Todos' ||
      (brand === 'O Boticário'
        ? ['o boticário', 'boticário', 'oboticário'].includes(category)
        : category === brand.toLowerCase());

    return matchesSearch && matchesBrand;
  });

  function askWhatsApp(product: Product) {
    if (!phone) return;

    const message =
      `Olá! Tenho interesse no produto ${product.name}, no valor de ` +
      `${Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. ` +
      'Poderia me dar mais informações?';

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }

  return (
    <main className="store">
      <header className="hero">
        <div className="brand-title">
          <Store size={34} />
          <div>
            <span className="eyebrow">LOJA ONLINE</span>
            <h1>Lourdes Cosmético e Utilidades</h1>
          </div>
        </div>
        <p>Encontre seus produtos favoritos e solicite sua compra pelo WhatsApp.</p>
      </header>

      <section className="catalog">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NOSSO CATÁLOGO</span>
            <h2>Produtos</h2>
          </div>
          <span>{filtered.length} produto(s)</span>
        </div>

        <div className="filters">
          {brands.map(item => (
            <button
              key={item}
              className={brand === item ? 'filter active' : 'filter'}
              onClick={() => setBrand(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <label className="search">
          <Search size={20} />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Pesquisar produto pelo nome..."
          />
        </label>

        {loading ? (
          <p className="status">Carregando produtos...</p>
        ) : error ? (
          <p className="status error">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="status">Nenhum produto encontrado.</p>
        ) : (
          <div className="products">
            {filtered.map(product => (
              <article
                key={product.id}
                className="product"
                onClick={() => setSelected(product)}
              >
                {product.image_url ? (
                  <img
                    className="product-image"
                    src={`${API.replace(/\/api\/?$/, '')}${product.image_url}`}
                    alt={product.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-image">Foto não disponível</div>
                )}

                <div className="product-info">
                  <span className="category">{product.category || 'Sem categoria'}</span>
                  <h3>{product.name}</h3>
                  <strong className="price">
                    {Number(product.price).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </strong>
                  <span className={product.available ? 'availability yes' : 'availability no'}>
                    {product.available ? 'Disponível' : 'Produto indisponível no momento'}
                  </span>
                  <button
                    type="button"
                    className="details-button"
                    onClick={event => {
                      event.stopPropagation();
                      setSelected(product);
                    }}
                  >
                    Ver detalhes
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${selected.name}`}
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-button"
              aria-label="Fechar"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>

            {selected.image_url ? (
              <img
                className="modal-image"
                src={`${API.replace(/\/api\/?$/, '')}${selected.image_url}`}
                alt={selected.name}
              />
            ) : (
              <div className="no-image modal-no-image">Foto não disponível</div>
            )}

            <span className="category">{selected.category || 'Sem categoria'}</span>
            <h2>{selected.name}</h2>
            <strong className="price">
              {Number(selected.price).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </strong>

            {selected.description && <p className="description">{selected.description}</p>}

            <p>
              <strong>Disponibilidade:</strong>{' '}
              {selected.available ? 'Disponível' : 'Produto indisponível no momento'}
            </p>

            {phone ? (
              <button
                type="button"
                className="whatsapp-button"
                onClick={() => askWhatsApp(selected)}
              >
                <MessageCircle size={20} />
                Pedir pelo WhatsApp
              </button>
            ) : (
              <p className="status">WhatsApp indisponível no momento.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
