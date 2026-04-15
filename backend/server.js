const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(express.json());

app.use((req, _res, next) => {
  console.log(req.method, req.url);
  next();
});

let products = [
  { id: 1, name: 'Áo thun basic', price: 150000 },
  { id: 2, name: 'Quần jeans slim', price: 450000 },
  { id: 3, name: 'Giày sneaker trắng', price: 890000 },
];

app.get('/api/products', (_req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  console.log('POST /api/products body:', req.body);

  const { name, price } = req.body;
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const parsedPrice = Number(price);

  if (!trimmedName) {
    return res.status(400).json({ error: 'Tên sản phẩm là bắt buộc' });
  }

  if (price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'Giá sản phẩm là bắt buộc' });
  }

  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Giá sản phẩm không hợp lệ' });
  }

  const newProduct = {
    id: Date.now(),
    name: trimmedName,
    price: parsedPrice,
  };

  products.push(newProduct);
  return res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  const index = products.findIndex((product) => product.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
  }

  products.splice(index, 1);
  return res.json({ message: 'Đã xoá thành công' });
});

app.listen(PORT, () => {
  console.log(`Backend chạy tại http://localhost:${PORT}`);
});
