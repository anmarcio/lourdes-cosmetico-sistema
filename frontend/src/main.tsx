import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Boxes, ShoppingCart, Users, Truck, LayoutDashboard, Store, Scissors, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import './styles.css';

type Product = { id:number; sku:string; name:string; supplier_name:string|null; category:string|null; price:number|string; stock_quantity:number; minimum_stock:number; active:boolean };
const API = 'http://localhost:3000/api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { const r = await fetch(`${API}/products`); setProducts(await r.json()); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const low = products.filter(p => p.stock_quantity <= p.minimum_stock);
  const menu = [
    ['Dashboard', LayoutDashboard],
    ['Produtos', Boxes],
    ['Estoque', RefreshCw], 
    ['Vendas', ShoppingCart],
    ['Clientes', Users], 
    ['Fornecedores', Truck], 
    ['Serviços', Scissors],
    ['Vitrine virtual', Store]
  ] as const;
  return <div className="app">
    <aside><div className="brand"><div className="logo">L</div><div><strong>Lourdes</strong><span>Cosmético e Utilidades</span></div></div>
      <nav>{menu.map(([name, Icon]) => <button className={tab===name?'active':''} onClick={()=>setTab(name)} key={name}><Icon size={18}/>{name}</button>)}</nav>
      <div className="side-note">Projeto Integrador II<br/><b>DRP01 — Turma 003</b></div>
    </aside>
    <main><header><div><small>GESTÃO INTEGRADA</small><h1>{tab}</h1></div><button className="outline" onClick={load}><RefreshCw size={16}/> Atualizar</button></header>
{tab === 'Dashboard' ? (
  <Dashboard products={products} low={low} loading={loading}/>
) : tab === 'Produtos' ? (
  <Products products={products} onCreated={load}/>
) : tab === 'Estoque' ? (
  <Stock products={products} onUpdated={load}/>
) : tab === 'Vendas' ? (
  <Sales products={products} onUpdated={load}/>
) : tab === 'Clientes' ? (
  <Customers />
) : tab === 'Fornecedores' ? (
  <Suppliers />
) : tab === 'Serviços' ? (
  <Services />
) : tab === 'Vitrine virtual' ? (
  <Storefront />
) : (
  <Placeholder title={tab}/>
)}
    </main>
  </div>
}

function Dashboard({products, low, loading}:{products:Product[];low:Product[];loading:boolean}) {
  return <section><div className="hero"><div><span className="eyebrow">TRANSFORMAÇÃO DIGITAL</span><h2>Controle da loja em um só lugar.</h2>
  <p>Base inicial para estoque, vendas, clientes, fornecedores e vitrine virtual.</p></div><div className="hero-card"><Store/><b>Vitrine virtual</b>
  <span>Atendimento via WhatsApp</span></div></div>
  <div className="cards"><Card icon={<Boxes/>} label="Produtos cadastrados" value={String(products.length)}/>
  <Card icon={<RefreshCw/>} label="Itens em estoque" value={String(products.reduce((a,p)=>a+p.stock_quantity,0))}/>
  <Card icon={<AlertTriangle/>} label="Abaixo do mínimo" value={String(low.length)} warn/></div>
  <div className="panel"><div className="panel-title"><h3>Estoque</h3><span>Visão inicial</span></div>
  {loading?<p>Carregando...</p>:<table><thead><tr><th>SKU</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th></tr></thead>
  <tbody>{products.map(p=><tr key={p.id}><td>{p.sku}</td><td><b>{p.name}</b></td><td>{p.category??'—'}</td>
  <td>R$ {Number(p.price).toFixed(2).replace('.',',')}</td><td>{p.stock_quantity}</td><td><span className={p.stock_quantity<=p.minimum_stock?'badge danger':'badge'}>
    {p.stock_quantity<=p.minimum_stock?'Repor':'Normal'}</span></td></tr>)}</tbody></table>}</div>
  </section>
}
function Card({icon,label,value,warn=false}:{icon:React.ReactNode;label:string;value:string;warn?:boolean}) { 
  return <div className={warn?'card warn':'card'}><div className="icon">{icon}</div><span>{label}</span><strong>{value}</strong></div> }

function Storefront() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API}/public/products`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Erro ao carregar produtos'
          );
        }

        setProducts(data);

      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar produtos.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <section>
      <div className="hero">
        <div>
          <span className="eyebrow">
            LOJA ONLINE
          </span>

          <h2>
            Produtos Lourdes
          </h2>

          <p>
            Consulte nossos produtos e solicite sua compra pelo WhatsApp.
          </p>
        </div>

        <div className="hero-card">
          <Store />

          <b>
            Atendimento via WhatsApp
          </b>

          <span>
            Consulte disponibilidade e faça sua solicitação.
          </span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>
            Produtos disponíveis
          </h3>

          <span>
            {products.length} produto(s)
          </span>
        </div>

        {loading ? (
          <p>
            Carregando produtos...
          </p>
        ) : error ? (
          <p>
            {error}
          </p>
        ) : products.length === 0 ? (
          <p>
            Nenhum produto disponível.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Disponibilidade</th>
              </tr>
            </thead>

            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  
                  <td>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    {product.image_url ? (
      <img
        src={`${API.replace('/api', '')}${product.image_url}`}
        alt={product.name}
        style={{
          width: '60px',
          height: '60px',
          objectFit: 'cover',
          borderRadius: '8px'
        }}
      />
    ) : (
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f1f1f1',
          fontSize: '12px'
        }}
      >
        Sem foto
      </div>
    )}

    <b>
      {product.name}
    </b>
  </div>
</td>

                  <td>
                    {product.category ?? '—'}
                  </td>

                  <td>
                    R$ {Number(product.price)
                      .toFixed(2)
                      .replace('.', ',')}
                  </td>

                  <td>
                    <span className="badge">
                      Disponível
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Products({ products,
  onCreated
}: {
  products: Product[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleNewProduct = () => {
    setEditingProduct(null);
    setOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(p => {
  const term = search.toLowerCase().trim();

  if (!term) return true;

  return (
    p.name?.toLowerCase().includes(term) ||
    p.sku?.toLowerCase().includes(term) ||
    p.category?.toLowerCase().includes(term) ||
    p.supplier_name?.toLowerCase().includes(term)
    );
  });

  return (
    <section>
      <div className="toolbar">
        <p>Cadastro centralizado de produtos e preços.</p>

        <input
          type="text"
          placeholder="Pesquisar produto, SKU ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={handleNewProduct}>
          <Plus size={16} /> Novo produto
        </button>
      </div>

      {open && (
        <ProductForm
          product={editingProduct}
          close={handleClose}
          done={onCreated}
        />
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produto</th>
              <th>Fornecedor</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Mínimo</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.supplier_name ?? '—'}</td>
                <td>{p.category ?? '—'}</td>

                <td>
                  R$ {Number(p.price).toFixed(2).replace('.', ',')}
                </td>

                <td>{p.stock_quantity}</td>

                <td>{p.minimum_stock}</td>

                <td>
                  <button
                    type="button"
                    className="outline"
                    onClick={() => handleEditProduct(p)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProductForm({
  close,
  done,
  product
 }: {
  close: () => void;
  done: () => void;
  product?: Product | null;
 }) {

  const [form,setForm]=useState({
  name:'',
  category:'',
  supplierId:'',
  price:'',
  stockQuantity:'0',
  minimumStock:'0'
 });

  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);

   useEffect(() => {
  if (product) {
    setForm({
      name: product.name ?? '',
      category: product.category ?? '',
      supplierId: '',
      price: product.price != null
        ? String(product.price)
        : '',
      stockQuantity: String(product.stock_quantity ?? 0),
      minimumStock: String(product.minimum_stock ?? 0)
    });
  } else {
    setForm({
      name: '',
      category: '',
      supplierId: '',
      price: '',
      stockQuantity: '0',
      minimumStock: '0'
    });
  }

  setImage(null);
}, [product]);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.error('Erro ao carregar categorias:', error));
  }, []);

  useEffect(() => {
  fetch(`${API}/suppliers`)
    .then(response => response.json())
    .then(data => setSuppliers(data))
    .catch(error => console.error('Erro ao carregar fornecedores:', error));
  }, []);

const submit = async (e: React.FormEvent) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append('name', form.name);
  formData.append('category', form.category);
  formData.append(
    'supplierId',
    form.supplierId ? form.supplierId : ''
  );
  formData.append('price', form.price);
  formData.append('stockQuantity', form.stockQuantity);
  formData.append('minimumStock', form.minimumStock);

  if (image) {
    formData.append('image', image);
  }

  const response = await fetch(
    product
      ? `${API}/products/${product.id}`
      : `${API}/products`,
    {
      method: product ? 'PUT' : 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    window.alert(
      data?.error ||
      (product
        ? 'Não foi possível atualizar o produto.'
        : 'Não foi possível cadastrar o produto.')
    );

    return;
  }

  close();
  done();
};

  return (
    <form className="form" onSubmit={submit}>
      <h3>{product ? 'Editar produto' : 'Novo produto'}</h3>

      <input
        required
        placeholder="Nome"
        value={form.name}
        onChange={e=>setForm({...form,name:e.target.value})}
      />

      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] ?? null)}
      />

      <select
        value={form.supplierId}
        onChange={e=>setForm({...form,supplierId:e.target.value})}
        >
        <option value="">Selecione um fornecedor</option>

        {suppliers.map(supplier => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.name}
          </option>
         ))}
      </select>

      <select
        value={form.category}
        onChange={e=>setForm({...form,category:e.target.value})}
      >
        <option value="">Selecione uma categoria</option>

        {categories.map(category => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
         ))}
      </select>

      <input
        required
        type="number"
        step="0.01"
        placeholder="Preço"
        value={form.price}
        onChange={e=>setForm({...form,price:e.target.value})}
      />

      <input
        type="number"
        placeholder="Estoque"
        value={form.stockQuantity}
        onChange={e=>setForm({...form,stockQuantity:e.target.value})}
      />

      <input
        type="number"
        placeholder="Estoque mínimo"
        value={form.minimumStock}
        onChange={e=>setForm({...form,minimumStock:e.target.value})}
      />

      <div>
        <button type="submit">Salvar</button>

        <button
          type="button"
          className="outline"
          onClick={close}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Stock({
  products,
  onUpdated
}: {
  products: Product[];
  onUpdated: () => void;
}) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadMovements = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/stock/movements`);
      const data = await response.json();
      setMovements(data);
    } catch {
      setMessage('Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const registerMovement = async (
    productId: number,
    type: 'IN' | 'OUT'
  ) => {
    const quantityText = window.prompt(
      type === 'IN'
        ? 'Digite a quantidade de entrada:'
        : 'Digite a quantidade de saída:'
    );

    if (!quantityText) return;

    const quantity = Number(quantityText);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      window.alert('Digite uma quantidade inteira maior que zero.');
      return;
    }

    const reason = window.prompt(
      type === 'IN'
        ? 'Digite o motivo da entrada:'
        : 'Digite o motivo da saída:'
    );

    try {
      const response = await fetch(`${API}/stock/movements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          type,
          quantity,
          reason: reason || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.error || 'Erro ao registrar movimentação.');
        return;
      }

      setMessage('Movimentação registrada com sucesso.');
      await loadMovements();
      onUpdated();
    } catch {
      window.alert('Não foi possível conectar à API.');
    }
  };

  return (
    <section>
      <div className="toolbar">
        <div>
          <h2>Controle de Estoque</h2>
          <p>Gerencie entradas, saídas e movimentações dos produtos.</p>
        </div>

        <button className="outline" onClick={loadMovements}>
          <RefreshCw size={16} />
          Atualizar histórico
        </button>
      </div>

      {message && (
        <div className="stock-message">
          {message}
        </div>
      )}

      <div className="panel">
        <div className="panel-title">
          <h3>Produtos em estoque</h3>
          <span>{products.length} produtos</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Estoque</th>
              <th>Mínimo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {products.map(product => {
              const lowStock =
                product.stock_quantity <= product.minimum_stock;

              return (
                <tr key={product.id}>
                  <td>{product.sku}</td>

                  <td>
                    <b>{product.name}</b>
                  </td>

                  <td>
                    {product.category ?? '—'}
                  </td>

                  <td>
                    <b>{product.stock_quantity}</b>
                  </td>

                  <td>
                    {product.minimum_stock}
                  </td>

                  <td>
                    <span
                      className={
                        lowStock
                          ? 'badge danger'
                          : 'badge'
                      }
                    >
                      {lowStock ? 'Repor' : 'Normal'}
                    </span>
                  </td>

                  <td>
                    <div className="stock-actions">
                      <button
                        onClick={() =>
                          registerMovement(product.id, 'IN')
                        }
                      >
                        Entrada
                      </button>

                      <button
                        className="outline"
                        onClick={() =>
                          registerMovement(product.id, 'OUT')
                        }
                      >
                        Saída
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel stock-history">
        <div className="panel-title">
          <h3>Histórico de movimentações</h3>
          <span>
            {loading
              ? 'Carregando...'
              : `${movements.length} movimentações`}
          </span>
        </div>

        {!loading && movements.length === 0 ? (
          <p>Nenhuma movimentação registrada.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Motivo</th>
              </tr>
            </thead>

            <tbody>
              {movements.map(movement => (
                <tr key={movement.id}>
                  <td>
                    {new Date(
                      movement.created_at
                    ).toLocaleString('pt-BR')}
                  </td>

                  <td>
                    <b>{movement.product_name}</b>
                  </td>

                  <td>
                    <span
                      className={
                        movement.type === 'IN'
                          ? 'badge'
                          : 'badge danger'
                      }
                    >
                      {movement.type === 'IN'
                        ? 'Entrada'
                        : 'Saída'}
                    </span>
                  </td>

                  <td>{movement.quantity}</td>

                  <td>
                    {movement.reason ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}



function Sales({  products,  onUpdated }: {  products: Product[];  onUpdated: () => void; }) {

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [creditEntry, setCreditEntry] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [items, setItems] = useState<
    {
      productId: number;
      name: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[]
  >([]);

 const [serviceItems, setServiceItems] = useState<
  {
    serviceId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[]
 >([]);

  const [selectedService, setSelectedService] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState('1');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [saleSearch, setSaleSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [saleDetailsLoading, setSaleDetailsLoading] = useState(false);
  const [saleStarted, setSaleStarted] = useState(false);
  const [saleFeedback, setSaleFeedback] = useState<'success' | 'cancelled' | null>(null);

  const loadSales = async () => {
    setSalesLoading(true);

    try {
      const response = await fetch(`${API}/sales`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erro ao carregar vendas'
        );
      }

      setSales(data);
    } catch (error) {
      console.error(error);

      setError(
        'Não foi possível carregar o histórico de vendas.'
      );
    } finally {
      setSalesLoading(false);
    }
  };

  const loadCustomers = async () => {
  setCustomersLoading(true);

  try {
    const response = await fetch(`${API}/customers`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Erro ao carregar clientes'
      );
    }

    setCustomers(data);
  } catch (error) {
    console.error(error);
  } finally {
    setCustomersLoading(false);
  }
 };

const loadServices = async () => {
  setServicesLoading(true);

  try {
    const response = await fetch(`${API}/services`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Erro ao carregar serviços'
      );
    }

    setServices(data);
  } catch (error) {
    console.error(error);
  } finally {
    setServicesLoading(false);
  }
};

const loadSaleDetails = async (saleId: number) => {
  setSaleDetailsLoading(true);
  setError('');

  try {
    const response = await fetch(
      `${API}/sales/${saleId}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Erro ao carregar detalhes da venda'
      );
    }

    console.log('Detalhes recebidos:', data);
    setSelectedSale(data);
  } catch (error) {
    console.error(error);

    setError(
      'Não foi possível carregar os detalhes da venda.'
    );
  } finally {
    setSaleDetailsLoading(false);
  }
};

const cancelSale = async (saleId: number) => {
  const confirmed = window.confirm(
    `Tem certeza que deseja cancelar a venda #${saleId}?\n\n` +
    `Os produtos dessa venda serão devolvidos ao estoque.`
  );

  if (!confirmed) {
    return;
  }

  setError('');
  setMessage('');

  try {
    const response = await fetch(
      `${API}/sales/${saleId}/cancel`,
      {
        method: 'POST'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Erro ao cancelar venda'
      );
    }

    setMessage(
      `Venda #${saleId} cancelada com sucesso.`
    );

    await loadSales();
    await loadSaleDetails(saleId);
    await onUpdated();

  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : 'Não foi possível cancelar a venda.'
    );
  }
};

  useEffect(() => {
    loadSales();
    loadCustomers();
    loadServices();
  }, []);

  const addItem = () => {
    setMessage('');
    setError('');

    const productId = Number(selectedProduct);
    const qty = Number(quantity);

    if (!productId) {
      setError('Selecione um produto.');
      return;
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      setError('Informe uma quantidade válida.');
      return;
    }

    const product = products.find(
      p => p.id === productId
    );

    if (!product) {
      setError('Produto não encontrado.');
      return;
    }

    if (qty > product.stock_quantity) {
      setError(
        `Estoque insuficiente. Disponível: ${product.stock_quantity}.`
      );
      return;
    }

    const existingItem = items.find(
      item => item.productId === productId
    );

    const totalQuantity =
      (existingItem?.quantity || 0) + qty;

    if (totalQuantity > product.stock_quantity) {
      setError(
        `A quantidade total ultrapassa o estoque disponível (${product.stock_quantity}).`
      );
      return;
    }

    if (existingItem) {
      setItems(
        items.map(item =>
          item.productId === productId
            ? {
                ...item,
                quantity: totalQuantity,
                subtotal:
                  totalQuantity * item.unitPrice
              }
            : item
        )
      );
    } else {
      const unitPrice = Number(product.price);

      setItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          quantity: qty,
          unitPrice,
          subtotal: qty * unitPrice
        }
      ]);
    }

    setSelectedProduct('');
    setQuantity('1');
  }; 

  const removeItem = (productId: number) => {
    setItems(
      items.filter(
        item => item.productId !== productId
      )
    );
  }; 

  const total =
  items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  ) +
  serviceItems.reduce(
    (sum, service) => sum + service.subtotal,
    0
  );

  const registerSale = async () => {
    setMessage('');
    setError('');

   if (items.length === 0 && serviceItems.length === 0) {
      setError('Adicione pelo menos um produto ou serviço.');
      return;
    }
    

    setSaving(true);

    try {
      const response = await fetch(
        `${API}/sales`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
  customerId: selectedCustomer
    ? Number(selectedCustomer)
    : null,

  items: items.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  })),

  services: serviceItems.map(service => ({
    serviceId: service.serviceId,
    quantity: service.quantity
  }))
})
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            'Não foi possível registrar a venda.'
        );
        return;
      }

      setMessage(
        `Venda #${data.sale.id} registrada com sucesso! Total: R$ ${Number(
          data.sale.total
        )
          .toFixed(2)
          .replace('.', ',')}`
      );

      setSaleFeedback('success');

      setTimeout(() => {
        setSaleFeedback(null);
        setSaleStarted(false);
      }, 3000);
      
      setItems([]);
      setServiceItems([]);
      setSelectedProduct('');
      setSelectedService('');
      setSelectedCustomer('');
      setQuantity('1');
      setServiceQuantity('1');

      await onUpdated();
      await loadSales();

    } catch {
      setError(
        'Não foi possível conectar ao servidor.'
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredSales = sales.filter(sale => {
  const term = saleSearch.toLowerCase().trim();

  if (!term) return true;

  const customerName = String(sale.customer_name ?? '').toLowerCase();
  const productNames = String(sale.product_names ?? '').toLowerCase();
  const saleId = String(sale.id ?? '').toLowerCase();
  const total = String(sale.total ?? '').toLowerCase();

  return (
    customerName.includes(term) ||
    productNames.includes(term) ||
    saleId.includes(term) ||
    total.includes(term)
  );
});

  return (
    <section>

      <div className="toolbar">
        <div>
          <h2>Registrar Venda</h2>

          <p>
            Selecione os produtos, informe as
            quantidades e finalize a venda.
          </p>
        </div>
      </div>

      {message && (
        <div className="stock-message">
          {message}
        </div>
      )}

      {error && (
        <div className="stock-message">
          {error}
        </div>
      )}

      <div
        className="panel"
        style={{
          border:
            saleStarted && !saleFeedback
              ? '2px solid #2563eb'
              : undefined,
          transition: 'border 0.3s ease'
        }}
      >

        <div className="panel-title">
          <h3>Adicionar produto</h3>

          <button
            type="button"
            onClick={() => {
              setSaleStarted(true);
              setSaleFeedback(null);
              setMessage('');
              setError('');
            }}
            className="secondary"
          >
            Nova venda
          </button>
        </div>

        <div className="form">

        <select
          value={selectedCustomer}
          onChange={e => setSelectedCustomer(e.target.value)}
          disabled={!saleStarted}
        >
          
  <option value="">
    {customersLoading
      ? 'Carregando clientes...'
      : 'Selecione o cliente'}
  </option>

  {customers.map(customer => (
    <option key={customer.id} value={customer.id}>
      {customer.name}
    </option>
  ))}
</select>

<div>
  <label>Forma de pagamento</label>

  <select
    value={paymentMethod}
    onChange={e => setPaymentMethod(e.target.value)}
    disabled={!saleStarted}
  >
    <option value="">
      Selecione a forma de pagamento
    </option>

    <option value="cash">
      Dinheiro
    </option>

    <option value="pix">
      PIX
    </option>

    <option value="debit_card">
      Cartão de débito
    </option>

    <option value="credit_card">
      Cartão de crédito
    </option>

    <option value="bank_transfer">
      Transferência bancária
    </option>

    <option value="credit">
      Fiado
    </option>
  </select>
</div>

{paymentMethod === 'credit' && (
  <div>
    <label>Valor da entrada / sinal</label>

    <input
      type="number"
      min="0"
      step="0.01"
      value={creditEntry}
      onChange={e => setCreditEntry(e.target.value)}
      disabled={!saleStarted}
      placeholder="0,00"
    />
  </div>
)}
          <select
            value={selectedProduct}
            onChange={e => setSelectedProduct(e.target.value)}
            disabled={!saleStarted}
          >
            <option value="">
              Selecione um produto
            </option>

            {products
              .filter(
                product =>
                  product.stock_quantity > 0
              )
              .map(product => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} — Estoque:{' '}
                  {product.stock_quantity} — R${' '}
                  {Number(product.price)
                    .toFixed(2)
                    .replace('.', ',')}
                </option>
              ))}
          </select>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e =>
              setQuantity(e.target.value)
            }
            placeholder="Quantidade"
            disabled={!saleStarted}
          />

          <button
            type="button"
            onClick={addItem}
          >
            <Plus size={16} />
            Adicionar
          </button>

        </div>
      </div>

          <div className="panel">

        <div className="panel-title">
          <h3>Adicionar serviço</h3>
          <span>Serviços</span>
        </div>

        <div className="form">

          <select
            value={selectedService}
            onChange={e =>
              setSelectedService(e.target.value)
            }
          >
            <option value="">
              {servicesLoading
                ? 'Carregando serviços...'
                : 'Selecione um serviço'}
            </option>

            {services
              .filter(service => service.active)
              .map(service => (
                <option
                  key={service.id}
                  value={service.id}
                >
                  {service.name} — R${' '}
                  {Number(service.price)
                    .toFixed(2)
                    .replace('.', ',')}
                </option>
              ))}
          </select>

          <input
            type="number"
            min="1"
            value={serviceQuantity}
            onChange={e =>
              setServiceQuantity(e.target.value)
            }
            placeholder="Quantidade"
          />

          <button
            type="button"
            onClick={() => {
              const service = services.find(
                item =>
                  item.id === Number(selectedService)
              );

              if (!service) {
                setError('Selecione um serviço.');
                return;
              }

              const quantity = Number(serviceQuantity);

              if (!Number.isInteger(quantity) || quantity <= 0) {
                setError('Informe uma quantidade válida.');
                return;
              }

              const unitPrice = Number(service.price);

              setServiceItems(prev => [
                ...prev,
                {
                  serviceId: service.id,
                  name: service.name,
                  quantity,
                  unitPrice,
                  subtotal: unitPrice * quantity
                }
              ]);

              setSelectedService('');
              setServiceQuantity('1');
              setError('');
            }}
          >
            <Plus size={16} />
            Adicionar serviço
          </button>

        </div>
      </div>

      <div className="panel">

        <div
          style={{
            border:
              saleFeedback === 'success'
                ? '3px solid #16a34a'
                : saleStarted
                  ? '3px solid #2563eb'
                  : undefined,
            borderRadius: '10px',
            padding: '16px',
            transition: 'border 0.3s ease'
          }}
        >

        <div className="panel-title">
          <h3>Itens da venda</h3>

          <span>
            {items.length} produto(s)
          </span>
        </div>

        {items.length === 0 && serviceItems.length === 0 ? (
          <p>Nenhum produto ou serviço adicionado à venda.</p>
        ) : (

          <table>

            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço unitário</th>
                <th>Subtotal</th>
                <th>Ação</th>
              </tr>
            </thead>

           <tbody>

  {items.map(item => (
    <tr key={`produto-${item.productId}`}>
      <td>
        <b>{item.name}</b>
        <small style={{ display: 'block' }}>
          Produto
        </small>
      </td>

      <td>{item.quantity}</td>

      <td>
        R$ {item.unitPrice.toFixed(2).replace('.', ',')}
      </td>

      <td>
        R$ {item.subtotal.toFixed(2).replace('.', ',')}
      </td>

      <td>
        <button
          className="outline"
          onClick={() => removeItem(item.productId)}
        >
          Remover
        </button>
      </td>
    </tr>
  ))}

  {serviceItems.map((service, index) => (
    <tr key={`servico-${service.serviceId}-${index}`}>
      <td>
        <b>{service.name}</b>
        <small style={{ display: 'block' }}>
          Serviço
        </small>
      </td>

      <td>{service.quantity}</td>

      <td>
        R$ {service.unitPrice.toFixed(2).replace('.', ',')}
      </td>

      <td>
        R$ {service.subtotal.toFixed(2).replace('.', ',')}
      </td>

      <td>
        <button
          className="outline"
          onClick={() => {
            setServiceItems(prev =>
              prev.filter((_, i) => i !== index)
            );
          }}
        >
          Remover
        </button>
      </td>
    </tr>
  ))}

</tbody>

          </table>
        )}

        <div className="sales-total">

          <strong>
            Total da venda:
          </strong>

          <strong>
            R${' '}
            {total
              .toFixed(2)
              .replace('.', ',')}
          </strong>

        </div>

        <div
  className="stock-actions"
  style={{ marginTop: '20px' }}
>

  <button
    onClick={registerSale}
    disabled={
      saving ||
      (items.length === 0 && serviceItems.length === 0)
    }
  >
    {saving
      ? 'Registrando...'
      : 'Finalizar venda'}
  </button>

  <button
    className="outline"
    onClick={() => {
      setItems([]);
      setServiceItems([]);
      setSelectedProduct('');
      setSelectedService('');
      setQuantity('1');
      setServiceQuantity('1');
      setError('');
      setMessage('');
    }}
  >
    Limpar
  </button>

</div>

</div>

</div>

  <div className="panel stock-history">
   <div className="panel-title">
    <h3>Histórico de vendas</h3>

    <span>
      {salesLoading
        ? 'Carregando...'
        : `${sales.length} venda(s)`}
    </span>
  </div>

  <input
  type="text"
  placeholder="Pesquisar por cliente, produto ou nº da venda..."
  value={saleSearch}
  onChange={e => setSaleSearch(e.target.value)}
  style={{ marginBottom: '16px' }}
/>

  {salesLoading ? (
    <p>Carregando histórico...</p>
  ) : sales.length === 0 ? (
    <p>Nenhuma venda registrada.</p>
  ) : (
    <table>
      <thead>
        <tr>
          <th>Venda</th>
          <th>Data</th>
          <th>Cliente</th>
          <th>Itens</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {filteredSales.map(sale => (
          <tr key={sale.id}
              onClick={() => {
              console.log('Clique na venda:', sale.id);
              loadSaleDetails(sale.id);
            }}
          >
            <td>
              <b>#{sale.id}</b>
            </td>

            <td>
              {new Date(
                sale.sold_at
              ).toLocaleString('pt-BR')}
            </td>

            <td>
              {sale.customer_name || 'Cliente não informado'}
            </td>

            <td>
              {sale.item_count}
            </td>

            <td>
              <b>
                R${' '}
                {Number(sale.total)
                  .toFixed(2)
                  .replace('.', ',')}
              </b>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
          )}
      </div>

{selectedSale && (
  <div
    className="panel"
    style={{
      marginTop: '20px',
      padding: '20px',
      border:
        selectedSale.sale?.status === 'cancelled'
          ? '3px solid #dc2626'
          : '3px solid #16a34a',
      borderRadius: '10px',
      transition: 'border 0.3s ease'
    }}
  >

    <div className="panel-title">
  <div>
    <h3>
      Detalhes da venda #{selectedSale.sale?.id}
    </h3>

    {selectedSale.sale?.status === 'cancelled' && (
      <div
        style={{
          color: '#dc2626',
          fontWeight: 'bold',
          fontSize: '18px',
          marginTop: '8px'
        }}
      >
        🔴 Venda Cancelada
      </div>
    )}
  </div>

  <div style={{ display: 'flex', gap: '8px' }}>
    {selectedSale.sale?.status !== 'cancelled' && (
      <button
        className="outline"
        onClick={() =>
          cancelSale(selectedSale.sale.id)
        }
      >
        Cancelar venda
      </button>
    )}

    <button
      className="secondary"
      onClick={() => setSelectedSale(null)}
    >
      Fechar
    </button>
  </div>
</div>

    {saleDetailsLoading ? (
      <p>Carregando detalhes...</p>
    ) : (
      <>
        <p>
          <b>Data da venda:</b>{' '}
          {new Date(
            selectedSale.sale?.sold_at
          ).toLocaleString('pt-BR')}
        </p>

        <p>
          <b>Cliente:</b>{' '}
          {selectedSale.sale?.customer_name || 'Não informado'}
        </p>

        <p>
          <b>Forma de pagamento:</b>{' '}
          {selectedSale.sale?.payment_method === 'cash'
            ? 'Dinheiro'
            : selectedSale.sale?.payment_method === 'pix'
            ? 'PIX'
            : selectedSale.sale?.payment_method === 'debit_card'
            ? 'Cartão de débito'
            : selectedSale.sale?.payment_method === 'credit_card'
            ? 'Cartão de crédito'
            : selectedSale.sale?.payment_method === 'bank_transfer'
            ? 'Transferência bancária'
            : selectedSale.sale?.payment_method === 'credit'
            ? 'Fiado'
            : 'Não informado'}
        </p>

        {selectedSale.products?.length > 0 && (
          <>
            <h4 style={{ marginTop: '20px' }}>
              Produtos
            </h4>

            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>SKU</th>
                  <th>Quantidade</th>
                  <th>Preço unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {selectedSale.products.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.sku}</td>
                    <td>{item.quantity}</td>
                    <td>
                      R${' '}
                      {Number(item.unit_price)
                        .toFixed(2)
                        .replace('.', ',')}
                    </td>
                    <td>
                      R${' '}
                      {Number(item.subtotal)
                        .toFixed(2)
                        .replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {selectedSale.services?.length > 0 && (
          <>
            <h4 style={{ marginTop: '20px' }}>
              Serviços
            </h4>

            <table>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Preço unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {selectedSale.services.map((service: any) => (
                  <tr key={service.id}>
                    <td>{service.service_name}</td>
                    <td>
                      {service.service_description || '—'}
                    </td>
                    <td>{service.quantity}</td>
                    <td>
                      R${' '}
                      {Number(service.unit_price)
                        .toFixed(2)
                        .replace('.', ',')}
                    </td>
                    <td>
                      R${' '}
                      {Number(service.subtotal)
                        .toFixed(2)
                        .replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div style={{ marginTop: '16px' }}>
          <strong>
            Total da venda: R${' '}
            {Number(selectedSale.sale?.total)
              .toFixed(2)
              .replace('.', ',')}
          </strong>
        </div>
      </>
    )}
  </div>
)}

  </section>
  );
}

function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API}/customers`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erro ao carregar clientes'
        );
      }

      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
  setMessage('');
  setError('');

  if (!name.trim()) {
    setError('Informe o nome do cliente.');
    return;
  }

  setSaving(true);

  try {
    const response = await fetch(`${API}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        phone,
        email
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Erro ao cadastrar cliente'
      );
    }

    setMessage('Cliente cadastrado com sucesso.');

    setName('');
    setPhone('');
    setEmail('');

    await loadCustomers();
  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : 'Erro ao cadastrar cliente.'
    );
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <section>
      <div className="panel">
        <div className="panel-title">
          <h3>Clientes</h3>

          <span>
            {loading
              ? 'Carregando...'
              : `${customers.length} cliente(s)`}
          </span>
        </div>

              <div style={{ marginBottom: '24px' }}>
        <h4>Novo cliente</h4>

        <div style={{ display: 'grid', gap: '12px' }}>
          <input
            type="text"
            placeholder="Nome do cliente *"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <button
            className="primary"
            onClick={createCustomer}
            disabled={saving}
          >
            {saving ? 'Cadastrando...' : 'Cadastrar cliente'}
          </button>

          {message && (
            <p>{message}</p>
          )}

          {error && (
            <p>{error}</p>
          )}
        </div>
      </div>

        {loading ? (
          <p>Carregando clientes...</p>
        ) : customers.length === 0 ? (
          <p>Nenhum cliente cadastrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Cadastro</th>
              </tr>
            </thead>

            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>
                    {new Date(
                      customer.created_at
                    ).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const loadSuppliers = () => {
    setLoading(true);

    fetch(`${API}/suppliers`)
      .then(response => response.json())
      .then(data => {
        setSuppliers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar fornecedores:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return (
    <section>
      <div className="toolbar">
        <p>Cadastro centralizado de fornecedores.</p>

        <button onClick={() => setOpen(true)}>
          <Plus size={16}/> Novo fornecedor
        </button>
      </div>

      {open && (
        <ServiceForm
          close={() => {
            setOpen(false);
            setEditingService(null);
          }}
          done={loadServices}
          service={editingService}
        />
      )}

      <div className="panel">
        <div className="panel-title">
          <h3>Fornecedores</h3>
          <span>{suppliers.length} cadastrado(s)</span>
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Endereço</th>
                <th>CNPJ</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.phone ?? '—'}</td>
                  <td>{supplier.email ?? '—'}</td>
                  <td>{supplier.address ?? '—'}</td>
                  <td>{supplier.cnpj ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function SupplierForm({close,done}:{close:()=>void;done:()=>void}) {
  const [form,setForm] = useState({
    name:'',
    phone:'',
    email:'',
    address:'',
    cnpj:''
  });

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();

    await fetch(`${API}/suppliers`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name:form.name,
        phone:form.phone,
        email:form.email,
        address:form.address,
        cnpj:form.cnpj
      })
    });

    close();
    done();
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <h3>Novo fornecedor</h3>
      </div>

      <form onSubmit={submit}>
        <input
          placeholder="Nome"
          value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})}
          required
        />

        <input
          placeholder="Telefone"
          value={form.phone}
          onChange={e=>setForm({...form,phone:e.target.value})}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}
        />

        <input
          placeholder="Endereço"
          value={form.address}
          onChange={e=>setForm({...form,address:e.target.value})}
        />

        <input
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={e=>setForm({...form,cnpj:e.target.value})}
        />

        <div>
          <button type="button" onClick={close}>
            Cancelar
          </button>

          <button type="submit">
            Salvar fornecedor
          </button>
        </div>
      </form>
    </div>
  );
}

function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);

  const loadServices = () => {
    setLoading(true);

    fetch(`${API}/services`)
      .then(response => response.json())
      .then(data => {
        setServices(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar serviços:', error);
        setLoading(false);
      });
  };

  const toggleServiceStatus = async (service: any) => {
  try {
    const response = await fetch(
      `${API}/services/${service.id}/status`,
      {
        method: 'PATCH'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Erro ao alterar status do serviço'
      );
    }

    await loadServices();

  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : 'Erro ao alterar status do serviço.'
    );
  }
};

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <section>
      <div className="toolbar">
        <div>
          <h2>Serviços</h2>
          <p>
            Cadastro e gerenciamento dos serviços oferecidos pela empresa.
          </p>
        </div>

        <button onClick={() => setOpen(true)}>
          <Plus size={16} />
          Novo serviço
        </button>
      </div>

      {open && (
        <ServiceForm
          close={() => {
            setOpen(false);
            setEditingService(null);
          }}
          done={loadServices}
          service={editingService}
        />
      )}

      <div className="panel">
        <div className="panel-title">
          <h3>Serviços cadastrados</h3>

          <span>
            {services.length} serviço(s)
          </span>
        </div>

        {loading ? (
          <p>Carregando serviços...</p>
        ) : services.length === 0 ? (
          <p>Nenhum serviço cadastrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {services.map(service => (
                <tr key={service.id}>
                  <td>
                    <b>{service.name}</b>
                  </td>

                  <td>
                    {service.description ?? '—'}
                  </td>

                  <td>
                    R${' '}
                    {Number(service.price)
                      .toFixed(2)
                      .replace('.', ',')}
                  </td>

                  <td>
                    <span
                      className={service.active ? 'badge' : 'badge danger'}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <td>
                    <button
                      className="outline"
                      onClick={() => {
                        setEditingService(service);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </button>

                    <button
                      className="outline"
                      style={{ marginLeft: '8px' }}
                      onClick={() => toggleServiceStatus(service)}
                    >
                      {service.active ? 'Inativar' : 'Ativar'}
                    </button>
                  </td>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function ServiceForm({
  close,
  done,
  service
 }: {
  close: () => void;
  done: () => void;
  service?: any | null;
 }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
  if (service) {
    setForm({
      name: service.name ?? '',
      description: service.description ?? '',
      price: service.price != null
        ? String(service.price)
        : ''
    });
  } else {
    setForm({
      name: '',
      description: '',
      price: ''
    });
  }
 }, [service]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!form.name.trim()) {
      setError('Informe o nome do serviço.');
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setError('Informe um preço válido.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        service
    ? `${API}/services/${service.id}`
    : `${API}/services`,
  {
    method: service ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Erro ao cadastrar serviço'
        );
      }

      setMessage(
      service
        ? 'Serviço atualizado com sucesso.'
        : 'Serviço cadastrado com sucesso.'
      );

      setForm({
        name: '',
        description: '',
        price: ''
      });

      await done();

      close();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar serviço.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">
        <h3>{service ? 'Editar serviço' : 'Novo serviço'}</h3>
      </div>

      <form className="form" onSubmit={submit}>
        <input
          required
          placeholder="Nome do serviço"
          value={form.name}
          onChange={e =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
        />

        <input
          placeholder="Descrição"
          value={form.description}
          onChange={e =>
            setForm({
              ...form,
              description: e.target.value
            })
          }
        />

        <input
          required
          type="number"
          min="0"
          step="0.01"
          placeholder="Preço"
          value={form.price}
          onChange={e =>
            setForm({
              ...form,
              price: e.target.value
            })
          }
        />

        {message && (
          <p>{message}</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        <div>
          <button
            type="button"
            className="outline"
            onClick={close}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? 'Salvando...'
              : service
                ? 'Salvar alterações'
                : 'Salvar serviço'}
          </button>
        </div>
      </form>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <App />
);
