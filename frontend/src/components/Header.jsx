import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCallback, useState, useEffect, useRef } from "react";
import './Header.css';
import { AxiosWithAuth } from "../../utils/AxiosWithAuth";
import CartDrawer from "./CartDrawer";

export function Header() {
  const navigate = useNavigate();
  const goCart = useCallback(() => navigate('/cart'), [navigate]);

  const [showCategories, setShowCategories] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const drawerRef = useRef(null);

  const toggleCategories = () => setShowCategories(p => !p);
  const toggleMobile = () => setMobileOpen(p => !p);
  const closeMobile = () => setMobileOpen(false);
  const toggleCartDrawer = () => setCartDrawerOpen(p => !p);


  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/products/search/${encodeURIComponent(term)}`);
  };

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') closeMobile(); };
    if (mobileOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  useEffect(() => {
    const onClick = e => {
      if (mobileOpen && drawerRef.current && !drawerRef.current.contains(e.target)) closeMobile();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [mobileOpen]);

  const handleLogout = async () => {
    const response = await AxiosWithAuth().post("/logout");
    console.log(response);
    localStorage.removeItem('token');
    window.dispatchEvent(new Event("auth-change"));
    setLoggedIn(false);
    navigate('/login');
  }


  const checkUser = useCallback(async () => {
    try {
      const response = await AxiosWithAuth().get('/authentication');
      if (response.data) {
        if (response.data.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    } catch (error) {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    const handler = () => checkUser();
    window.addEventListener('storage', handler);
    window.addEventListener("auth-change", handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener("auth-change", handler);
    }
  }, [checkUser]);

  const loggedOutView = (
    <nav className="loggedOutActions desktopOnly" aria-label="Primary">
      <Link to="/team">Team</Link>
      <Link to="/login" className="ghostBtn">Login</Link>
      <Link to="/register" className="ghostBtn highlight">Register</Link>
      <button type="button" className="cartIconBtn" onClick={toggleCartDrawer} aria-label="Cart drawer">
        🛒
      </button>
    </nav>
  );

  const loggedInView = (
    <nav className="loggedInActions desktopOnly" aria-label="Primary">
      <Link to="/team">Team</Link>
      <Link to="/orders">Orders</Link>
      <Link to="/user/profile">Profile</Link>
      <button type="button" className="cartIconBtn" onClick={toggleCartDrawer} aria-label="Cart drawer">
        🛒
      </button>
      <button onClick={handleLogout} className="ghostBtn logoutBtn">Logout</button>
    </nav>
  );

  const adminView = (
    <nav className="loggedInActions desktopOnly" aria-label="Primary">
      <Link to="/admin">Admin</Link>
      <Link to="/user/profile">Profile</Link>
      <button onClick={handleLogout} className="ghostBtn logoutBtn">Logout</button>
    </nav>
  );

  const mobileLogOutNavLinks = (
    <nav className="mobileLogOutNavLinks">
      <Link to="/products" onClick={closeMobile}>Products</Link>
      <Link to="/team" onClick={closeMobile}>Team</Link>
      <Link to="/login" onClick={closeMobile}>Login</Link>
      <Link to="/register" onClick={closeMobile} className="highlight">Register</Link>
      <button onClick={() => { closeMobile(); goCart(); }} className="cartBtnLine">Cart</button>
    </nav>
  );

  const mobileLogInNavLinks = (
    <nav className="mobileLogInNavLinks">
      <Link to="/products" onClick={closeMobile}>Products</Link>
      <Link to="/orders" onClick={closeMobile}>Orders</Link>
      <Link to="/user/profile" onClick={closeMobile}>Profile</Link>
      {/* Cart drawer trigger lives in header; drawer rendered outside mobile nav */}
      <button onClick={() => { closeMobile(); handleLogout(); }} className="cartBtnLine">Logout</button>
    </nav>
  );

  const mobileAdminView = (
    <nav className="mobileLogInNavLinks">
      <Link to="/admin" onClick={closeMobile}>Admin</Link>
      <Link to="/user/profile" onClick={closeMobile}>Profile</Link>
      <button onClick={() => { closeMobile(); handleLogout(); }} className="cartBtnLine">Logout</button>
    </nav>
  );

  useEffect(() => {
    if (cartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [cartDrawerOpen]);

  const location = useLocation();
  useEffect(() => {
    setMobileOpen(false);
    setCartDrawerOpen(false);
  }, [location.pathname]);


  return (
    <div className="appHeader">
      <header className="topBar">
        <div className="container topBar__inner">
          <Link to="/home" className="brand" aria-label="Home">E-Commerce</Link>

          <button className="categoriesBtn desktopOnly" onClick={toggleCategories} type="button">
            <span className="icon">☰</span>
            Categories
          </button>
          <nav className="leftNavLinks desktopOnly">
            <Link to="/products">Products</Link>
          </nav>

          <form className="searchBar desktopOnly" role="search" onSubmit={handleSearch}>
            <input
              placeholder="Search products..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          {!loggedIn && loggedOutView}
          {loggedIn && (isAdmin ? adminView : loggedInView)}

          <button
            type="button"
            className="cartIconBtn mobileOnly"
            aria-label="Open cart"
            onClick={toggleCartDrawer}
          >
            🛒
          </button>

          <button
            className="mobileMenuBtn"
            type="button"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={toggleMobile}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {showCategories &&
        <div className="categoryStrip">
          <div className="container catScroll">
            <button className="catTag">Electronics</button>
            <button className="catTag">Fashion</button>
            <button className="catTag">Beauty</button>
            <button className="catTag">Home</button>
            <button className="catTag">Sports</button>
            <button className="catTag">Toys</button>
          </div>
        </div>
      }

      <div className={`mobileOverlay ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <aside ref={drawerRef} className={`mobileDrawer ${mobileOpen ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
          <div className="mobileDrawer__header">
            <span className="brandMini">Demo</span>
            <button onClick={closeMobile} className="closeBtn" aria-label="Close menu">✕</button>
          </div>

          <form className="mobileSearch" role="search" onSubmit={(e) => { handleSearch(e); closeMobile(); }}>
            <input
              placeholder="Search products..."
              aria-label="Search mobile"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <div className="mobileCats">
            <h4>Categories</h4>
            <div className="catList">
              {['Electronics', 'Fashion', 'Beauty', 'Home', 'Sports', 'Toys'].map(c => (
                <button key={c} className="catTag">{c}</button>
              ))}
            </div>
          </div>

          {!loggedIn && mobileLogOutNavLinks}
          {loggedIn && (isAdmin ? mobileAdminView : mobileLogInNavLinks)}

        </aside>
      </div >
      <CartDrawer open={cartDrawerOpen} onClose={toggleCartDrawer} goCart={goCart} />
    </div >
  );
}

export default Header;