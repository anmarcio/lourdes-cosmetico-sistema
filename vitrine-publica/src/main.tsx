import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {  Store,  Search,  MessageCircle,  X,  Accessibility} from 'lucide-react';
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

function AccessibilityButton() {
  const [panelOpen, setPanelOpen] = useState(false);

  const [fontSize, setFontSize] = useState(
    () => Number(localStorage.getItem('lourdes_font_size')) || 100
  );

  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('lourdes_high_contrast') === 'true'
  );

  const [speed, setSpeed] = useState(1);
  const [reading, setReading] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
      document.documentElement.classList.toggle(
        'high-contrast',
        highContrast
      );

      document.documentElement.style.fontSize = `${fontSize}%`;

      localStorage.setItem('lourdes_font_size', String(fontSize));
      localStorage.setItem('lourdes_high_contrast', String(highContrast));
    }, [fontSize, highContrast]);
      useEffect(() => {
      return () => {
        window.speechSynthesis.cancel();
      };
    }, []);

    function stopReading() {
      window.speechSynthesis.cancel();
      setReading(false);
      setPaused(false);
  }

  function readText(text: string) {
    const cleanText = text.trim();

    if (!cleanText) {
      alert('Não há texto disponível para leitura.');
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não oferece suporte à leitura de voz.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = speed;

    utterance.onstart = () => {
      setReading(true);
      setPaused(false);
    };

    utterance.onend = () => {
      setReading(false);
      setPaused(false);
    };

    utterance.onerror = () => {
      setReading(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function readPage() {
    const main = document.querySelector('main');

    const content = main
      ? main.cloneNode(true) as HTMLElement
      : document.body.cloneNode(true) as HTMLElement;

    content.querySelectorAll(
      'button, input, select, textarea, nav, header, aside, .accessibility-container, script, style'
    ).forEach(element => element.remove());

    readText(content.innerText || content.textContent || '');
  }

  function readSelection() {
    const selectedText = window.getSelection()?.toString() || '';

    if (!selectedText.trim()) {
      alert('Selecione um texto na tela antes de iniciar a leitura.');
      return;
    }

    readText(selectedText);
  }

  function togglePause() {
    if (!reading) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function resetAccessibility() {
    stopReading();
    setFontSize(100);
    setHighContrast(false);
    setSpeed(1);
  }

  return (
    <div className="accessibility-container">
      <button
        type="button"
        className="accessibility-button"
        aria-label={
          panelOpen
            ? 'Fechar opções de acessibilidade'
            : 'Abrir opções de acessibilidade'
        }
        aria-expanded={panelOpen}
        aria-controls="accessibility-panel"
        onClick={() => setPanelOpen(value => !value)}
      >
        <Accessibility size={38} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {panelOpen && (

        <div
          className="accessibility-panel"
          id="accessibility-panel"
        >
          <strong>Opções de acessibilidade</strong>

          <div>
            <button
              type="button"
              onClick={() => setFontSize(size => Math.max(80, size - 10))}
            >
              A−
            </button>

            <span>{fontSize}%</span>

            <button
              type="button"
              onClick={() => setFontSize(size => Math.min(150, size + 10))}
            >
              A+
            </button>
          </div>

          <button
            type="button"
            aria-pressed={highContrast}
            onClick={() => setHighContrast(value => !value)}
          >
            {highContrast ? 'Desativar' : 'Ativar'} alto contraste
          </button>

          <hr />

          <strong>Leitura por voz</strong>

          <button type="button" onClick={readPage}>
            🔊 Ler página
          </button>

          <button type="button" onClick={readSelection}>
            Ler texto selecionado
          </button>

          <button
            type="button"
            onClick={togglePause}
            disabled={!reading}
          >
            {paused ? 'Continuar leitura' : 'Pausar leitura'}
          </button>

          <button
            type="button"
            onClick={stopReading}
            disabled={!reading}
          >
            Parar leitura
          </button>

          <label htmlFor="accessibility-speed">
            Velocidade da leitura: {speed.toFixed(1)}x
          </label>

          <input
            id="accessibility-speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={event => setSpeed(Number(event.target.value))}
          />

          <button type="button" onClick={resetAccessibility}>
            Restaurar padrão
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [phone, setPhone] = useState('');
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('Todos');
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (selected) {
      closeButtonRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [selected]);

    useEffect(() => {
    if (!selected) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSelected(null);
        return;
      }

      if (event.key === 'Tab') {
        const modal = document.querySelector('.modal');

        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected]);

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

    function readProduct(product: Product) {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não oferece suporte à leitura de voz.');
      return;
    }

    window.speechSynthesis.cancel();

    const price = Number(product.price).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const text = [
      `Produto: ${product.name}.`,
      `Categoria: ${product.category || 'Sem categoria'}.`,
      `Preço: ${price}.`,
      product.description
        ? `Descrição: ${product.description}.`
        : '',
      `Disponibilidade: ${
        product.available
          ? 'Disponível'
          : 'Produto indisponível no momento'
      }.`,
    ].filter(Boolean).join(' ');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;

    window.speechSynthesis.speak(utterance);
  }

   return (
      <>
        <AccessibilityButton />

        <a className="skip-link" href="#conteudo-principal">
          Pular para o conteúdo principal
        </a>

        <main className="store" id="conteudo-principal" tabIndex={-1}>
       <header className="hero">s
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
          <span aria-live="polite" aria-atomic="true">
            {filtered.length} produto(s) encontrado(s)
          </span>
        </div>

        <div className="filters">
          {brands.map(item => (
            <button
              key={item}
              className={brand === item ? 'filter active' : 'filter'}
              aria-pressed={brand === item}
              onClick={() => setBrand(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <label className="search">
          <span className="sr-only">Pesquisar produtos pelo nome</span>
          <Search size={20} />
          <input
            aria-label="Pesquisar produtos pelo nome"
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
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalhes do produto ${product.name}`}
                  onClick={event => {
                    previousFocusRef.current = event.currentTarget;
                    setSelected(product);
                  }}
                  onKeyDown={event => {
                    if (event.target !== event.currentTarget) return;

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      previousFocusRef.current = event.currentTarget;
                      setSelected(product);
                    }
                  }}
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
                      previousFocusRef.current = event.currentTarget;
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
            onKeyDownCapture={event => {
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                setSelected(null);
              }
            }}
          >
           <button
              ref={closeButtonRef}
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

            <div className="product-reading-controls">
              <button
                type="button"
                onClick={() => readProduct(selected)}
              >
                🔊 Ouvir informações do produto
              </button>

              <button
                type="button"
                onClick={() => window.speechSynthesis.pause()}
              >
                ⏸ Pausar
              </button>

              <button
                type="button"
                onClick={() => window.speechSynthesis.resume()}
              >
                ▶ Continuar
              </button>

              <button
                type="button"
                onClick={() => window.speechSynthesis.cancel()}
              >
                ⏹ Parar
              </button>
            </div>

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
  </>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
