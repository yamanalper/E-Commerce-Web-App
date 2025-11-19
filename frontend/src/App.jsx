import './App.css';
import { HashRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { Home } from './Pages/home';
import { Login } from './Pages/login';
import { Register } from './Pages/register';
import { Profile } from './Pages/profile';
import { Products } from './Pages/products';
import { ProductDetail } from './Pages/product_detail';
import { Cart } from './Pages/cart';
import { Orders } from './Pages/orders';
import { Payment } from './Pages/payment';
import { Team } from './Pages/team';
import Header from './components/Header';
import { Search } from './Pages/search';
import { Admin } from './Pages/admin';
import { AdminProducts } from './Pages/admin_products';
import { EditProducts } from './Pages/admin_edit_products';
import { CreateProduct } from './Pages/admin_create_product';

function Layout() {
  return (
    <div className="appShell">
      <Header />
      <main style={{ padding: '0 1rem 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user/profile" element={<Profile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:product_id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/team" element={<Team />} />
          <Route path="/products/search/:query" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/edit/:product_id" element={<EditProducts />} />
          <Route path="/admin/products/new" element={<CreateProduct />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;