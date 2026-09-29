import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { Pool } from 'pg';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'products'));
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const fileName = `${Date.now()}${extension}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage
});

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5174' }));

app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'))
);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' });
  }
});

app.get('/api/products', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.sku,
      p.name,
      s.name AS supplier_name,
      p.category,
      p.price,
      p.stock_quantity,
      p.minimum_stock,
      p.active,
      p.image_url
    FROM products p
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    ORDER BY p.name
  `);

  res.json(rows);
});

app.get('/api/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name
      FROM categories
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar categorias' });
  }
});

app.get('/api/suppliers', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, phone, email, address, cnpj
      FROM suppliers
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar fornecedores' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, phone, email, address, cnpj } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const { rows } = await pool.query(`
      INSERT INTO suppliers (
        name,
        phone,
        email,
        address,
        cnpj
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, phone, email, address, cnpj
    `, [
      name,
      phone ?? null,
      email ?? null,
      address ?? null,
      cnpj ?? null
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar fornecedor' });
  }
});

app.get('/api/services', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        name,
        description,
        price,
        active,
        created_at
      FROM services
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao consultar serviços' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome do serviço é obrigatório'
      });
    }

    const { rows } = await pool.query(`
      INSERT INTO services (
        name,
        description,
        price
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        description,
        price,
        active,
        created_at
    `, [
      name,
      description ?? null,
      price ?? 0
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Erro ao cadastrar serviço'
    });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { name, description, price } = req.body;

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        error: 'ID do serviço inválido'
      });
    }

    if (!name) {
      return res.status(400).json({
        error: 'Nome do serviço é obrigatório'
      });
    }

    const { rows } = await pool.query(`
      UPDATE services
      SET
        name = $1,
        description = $2,
        price = $3
      WHERE id = $4
      RETURNING
        id,
        name,
        description,
        price,
        active,
        created_at
    `, [
      name,
      description ?? null,
      price ?? 0,
      serviceId
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao atualizar serviço'
    });
  }
});

app.patch('/api/services/:id/status', async (req, res) => {
  try {
    const serviceId = Number(req.params.id);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return res.status(400).json({
        error: 'ID do serviço inválido'
      });
    }

    const { rows } = await pool.query(`
      UPDATE services
      SET active = NOT active
      WHERE id = $1
      RETURNING
        id,
        name,
        description,
        price,
        active,
        created_at
    `, [serviceId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao alterar status do serviço'
    });
  }
});

app.get('/api/customers', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, phone, email, created_at
      FROM customers
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao consultar clientes'
    });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: 'Nome é obrigatório'
      });
    }

    const { rows } = await pool.query(`
      INSERT INTO customers (name, phone, email)
      VALUES ($1, $2, $3)
      RETURNING id, name, phone, email, created_at
    `, [
      name.trim(),
      phone?.trim() || null,
      email?.trim() || null
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao cadastrar cliente'
    });
  }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  const {
    name,
    category,
    supplierId,
    price,
    stockQuantity = 0,
    minimumStock = 0
  } = req.body;

  if (!name || price == null) {
    return res.status(400).json({
      error: 'name e price são obrigatórios'
    });
  }

  const imageUrl = req.file
    ? `/uploads/products/${req.file.filename}`
    : null;

  const { rows } = await pool.query(`
    INSERT INTO products (
      sku,
      name,
      category,
      supplier_id,
      price,
      stock_quantity,
      minimum_stock,
      image_url
    )
    SELECT
      'LOR-' || LPAD(
        (COALESCE(MAX(
          CASE
            WHEN sku LIKE 'LOR-%'
            THEN CAST(SUBSTRING(sku FROM 5) AS INTEGER)
          END
        ), 0) + 1)::TEXT,
        3,
        '0'
      ),
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7
    FROM products
    RETURNING *
  `, [
    name,
    category ?? null,
    supplierId ? Number(supplierId) : null,
    price,
    stockQuantity,
    minimumStock,
    imageUrl
  ]);

  res.status(201).json(rows[0]);
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const {
      name,
      category,
      supplierId,
      price,
      stockQuantity,
      minimumStock
    } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        error: 'ID do produto inválido'
      });
    }

    if (!name || price == null) {
      return res.status(400).json({
        error: 'name e price são obrigatórios'
      });
    }

    let query = `
      UPDATE products
      SET
        name = $1,
        category = $2,
        supplier_id = $3,
        price = $4,
        stock_quantity = $5,
        minimum_stock = $6,
        updated_at = NOW()
    `;

    const values: any[] = [
      name,
      category || null,
      supplierId ? Number(supplierId) : null,
      Number(price),
      Number(stockQuantity ?? 0),
      Number(minimumStock ?? 0)
    ];

    if (req.file) {
      const imageUrl = `/uploads/products/${req.file.filename}`;

      query += `,
        image_url = $7
      `;

      values.push(imageUrl);
    }

    query += `
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    values.push(productId);

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao atualizar produto'
    });
  }
});

app.get('/api/stock/alerts', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT id, sku, name, stock_quantity, minimum_stock
    FROM products
    WHERE active = TRUE AND stock_quantity <= minimum_stock
    ORDER BY stock_quantity ASC, name
  `);
  res.json(rows);
});

app.post('/api/stock/movements', async (req, res) => {
  const { productId, type, quantity, reason } = req.body;

  if (!productId || !type || !quantity) {
    return res.status(400).json({
      error: 'productId, type e quantity são obrigatórios'
    });
  }

  if (!['IN', 'OUT'].includes(type)) {
    return res.status(400).json({
      error: 'type deve ser IN ou OUT'
    });
  }

  if (quantity <= 0) {
    return res.status(400).json({
      error: 'quantity deve ser maior que zero'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      'SELECT id, name, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );

    if (productResult.rowCount === 0) {
      await client.query('ROLLBACK');

      return res.status(404).json({
        error: 'Produto não encontrado'
      });
    }

    const product = productResult.rows[0];

    if (type === 'OUT' && product.stock_quantity < quantity) {
      await client.query('ROLLBACK');

      return res.status(400).json({
        error: 'Estoque insuficiente',
        currentStock: product.stock_quantity
      });
    }

    const newStock =
      type === 'IN'
        ? product.stock_quantity + quantity
        : product.stock_quantity - quantity;

    await client.query(
      `UPDATE products
       SET stock_quantity = $1
       WHERE id = $2`,
      [newStock, productId]
    );

    const movementResult = await client.query(
      `INSERT INTO stock_movements
       (product_id, type, quantity, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [productId, type, quantity, reason ?? null]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Movimentação registrada com sucesso',
      movement: movementResult.rows[0],
      product: {
        id: product.id,
        name: product.name,
        previousStock: product.stock_quantity,
        newStock
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error);

    res.status(500).json({
      error: 'Erro ao registrar movimentação'
    });
  } finally {
    client.release();
  }
});

app.get('/api/stock/movements', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        sm.id,
        sm.product_id,
        p.sku,
        p.name AS product_name,
        sm.type,
        sm.quantity,
        sm.reason,
        sm.created_at
      FROM stock_movements sm
      INNER JOIN products p ON p.id = sm.product_id
      ORDER BY sm.created_at DESC, sm.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao consultar movimentações de estoque'
    });
  }
});

app.get('/api/sales', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        s.id,
        s.customer_id,
        c.name AS customer_name,
        s.total,
        s.sold_at,
        (
          COALESCE((
            SELECT SUM(si.quantity)
            FROM sale_items si
            WHERE si.sale_id = s.id
          ), 0)
          +
          COALESCE((
            SELECT SUM(ss.quantity)
            FROM sale_services ss
            WHERE ss.sale_id = s.id
          ), 0)
        ) AS item_count
      FROM sales s
      LEFT JOIN customers c
        ON c.id = s.customer_id
      ORDER BY s.sold_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao consultar histórico de vendas'
    });
  }
});

app.post('/api/sales', async (req, res) => {
  const {
    customerId = null,
    items = [],
    services = []
  } = req.body;

  if (
    (!Array.isArray(items) || items.length === 0) &&
    (!Array.isArray(services) || services.length === 0)
  ) {
    return res.status(400).json({
      error: 'A venda deve possuir pelo menos um produto ou serviço'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let total = 0;

    const saleItems = [];
    const saleServices = [];

    /*
     * PROCESSAMENTO DOS PRODUTOS
     */
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          error: 'Produto e quantidade inválidos'
        });
      }

      const productResult = await client.query(
        `SELECT id, name, price, stock_quantity
         FROM products
         WHERE id = $1 AND active = TRUE
         FOR UPDATE`,
        [productId]
      );

      if (productResult.rowCount === 0) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          error: `Produto ${productId} não encontrado`
        });
      }

      const product = productResult.rows[0];

      if (product.stock_quantity < quantity) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          error: `Estoque insuficiente para ${product.name}`,
          currentStock: product.stock_quantity,
          requestedQuantity: quantity
        });
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * quantity;

      total += subtotal;

      saleItems.push({
        productId,
        productName: product.name,
        quantity,
        unitPrice,
        subtotal,
        previousStock: product.stock_quantity,
        newStock: product.stock_quantity - quantity
      });
    }

    /*
     * PROCESSAMENTO DOS SERVIÇOS
     */
    for (const serviceItem of services) {
      const serviceId = Number(serviceItem.serviceId);
      const quantity = Number(serviceItem.quantity);

      if (
        !Number.isInteger(serviceId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          error: 'Serviço e quantidade inválidos'
        });
      }

      const serviceResult = await client.query(
        `SELECT id, name, price
         FROM services
         WHERE id = $1 AND active = TRUE`,
        [serviceId]
      );

      if (serviceResult.rowCount === 0) {
        await client.query('ROLLBACK');

        return res.status(404).json({
          error: `Serviço ${serviceId} não encontrado`
        });
      }

      const service = serviceResult.rows[0];

      const unitPrice = Number(service.price);
      const subtotal = unitPrice * quantity;

      total += subtotal;

      saleServices.push({
        serviceId,
        serviceName: service.name,
        quantity,
        unitPrice,
        subtotal
      });
    }

    /*
     * CRIA A VENDA
     */
    const saleResult = await client.query(
      `INSERT INTO sales (customer_id, total)
       VALUES ($1, $2)
       RETURNING id, customer_id, total, sold_at`,
      [customerId, total]
    );

    const sale = saleResult.rows[0];

    /*
     * REGISTRA OS PRODUTOS
     */
    for (const item of saleItems) {
      await client.query(
        `INSERT INTO sale_items
         (sale_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [
          sale.id,
          item.productId,
          item.quantity,
          item.unitPrice
        ]
      );

      await client.query(
        `UPDATE products
         SET stock_quantity = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [
          item.newStock,
          item.productId
        ]
      );

      await client.query(
        `INSERT INTO stock_movements
         (product_id, type, quantity, reason)
         VALUES ($1, 'OUT', $2, $3)`,
        [
          item.productId,
          item.quantity,
          `Venda #${sale.id}`
        ]
      );
    }

    /*
     * REGISTRA OS SERVIÇOS
     */
    for (const service of saleServices) {
      await client.query(
        `INSERT INTO sale_services
         (sale_id, service_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          sale.id,
          service.serviceId,
          service.quantity,
          service.unitPrice,
          service.subtotal
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Venda registrada com sucesso',

      sale: {
        id: sale.id,
        customerId: sale.customer_id,
        total: sale.total,
        soldAt: sale.sold_at
      },

      items: saleItems,

      services: saleServices
    });

  } catch (error) {
    await client.query('ROLLBACK');

    console.error(error);

    res.status(500).json({
      error: 'Erro ao registrar venda'
    });

  } finally {
    client.release();
  }
});

app.get('/api/sales/:id', async (req, res) => {
  try {
    const saleId = Number(req.params.id);

    if (!Number.isInteger(saleId) || saleId <= 0) {
      return res.status(400).json({
        error: 'ID da venda inválido'
      });
    }

    const saleResult = await pool.query(`
      SELECT
        s.id,
        s.customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        s.total,
        s.sold_at
      FROM sales s
      LEFT JOIN customers c
        ON c.id = s.customer_id
      WHERE s.id = $1
    `, [saleId]);

    if (saleResult.rowCount === 0) {
      return res.status(404).json({
        error: 'Venda não encontrada'
      });
    }

    const sale = saleResult.rows[0];

    const productsResult = await pool.query(`
      SELECT
        si.id,
        si.product_id,
        p.name AS product_name,
        p.sku,
        si.quantity,
        si.unit_price,
        (si.quantity * si.unit_price) AS subtotal
      FROM sale_items si
      INNER JOIN products p
        ON p.id = si.product_id
      WHERE si.sale_id = $1
      ORDER BY si.id
    `, [saleId]);

    const servicesResult = await pool.query(`
      SELECT
        ss.id,
        ss.service_id,
        sv.name AS service_name,
        sv.description AS service_description,
        ss.quantity,
        ss.unit_price,
        ss.subtotal
      FROM sale_services ss
      INNER JOIN services sv
        ON sv.id = ss.service_id
      WHERE ss.sale_id = $1
      ORDER BY ss.id
    `, [saleId]);

    res.json({
      sale,
      products: productsResult.rows,
      services: servicesResult.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro ao consultar detalhes da venda'
    });
  }
});

app.get('/api/public/products', async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      id,
      name,
      category,
      price,
      stock_quantity,
      image_url
    FROM products
    WHERE active = TRUE
    ORDER BY name
  `);

  res.json(rows);
});

app.listen(port, () => {
  console.log(`Lourdes API running at http://localhost:${port}`);
});
