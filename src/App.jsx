import React, { useEffect, useState, useCallback } from 'react';
import Nav from './components/Nav.jsx';
import Home from './components/Home.jsx';
import About from './components/About.jsx';
import Leadership from './components/Leadership.jsx';
import Gallery from './components/Gallery.jsx';
import Resources from './components/Resources.jsx';
import Projects from './components/Projects.jsx';
import Store from './components/Store.jsx';
import Orders from './components/Orders.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Footer from './components/Footer.jsx';
import AdminLoginModal from './components/AdminLoginModal.jsx';
import WordPressAdminBar from './components/WordPressAdminBar.jsx';
import SiteCustomizer from './components/SiteCustomizer.jsx';
import { useAuth, signOut } from './lib/auth.js';
import { subscribeCollection, subscribeDoc, deleteItem, addItem, updateItem } from './lib/db.js';
import { deleteFile } from './lib/storage.js';
import { seedIfNeeded } from './lib/seed.js';
import {
  DEFAULT_TEXT,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_LEADERS,
  DEFAULT_GALLERY,
  DEFAULT_RESOURCES,
  DEFAULT_PROJECTS,
  DEFAULT_STORE,
  DEFAULT_FACULTY
} from './data/defaults.js';

const DELETED_LEADERS_KEY = 'adges_deleted_leaders';
const DELETED_FACULTY_KEY = 'adges_deleted_faculty';

function getDeletedIds(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isItemDeleted(item, deletedList) {
  if (!item || !deletedList || deletedList.length === 0) return false;
  const idLower = String(item.id || '').trim().toLowerCase();
  const nameLower = String(item.name || '').trim().toLowerCase();
  return deletedList.some(d => {
    const dLower = String(d).trim().toLowerCase();
    return (idLower && dLower === idLower) || (nameLower && dLower === nameLower);
  });
}

function addDeletedId(key, idOrName) {
  if (!idOrName) return;
  const val = String(idOrName).trim();
  if (!val) return;
  try {
    const list = getDeletedIds(key);
    if (!list.some(existing => String(existing).trim().toLowerCase() === val.toLowerCase())) {
      list.push(val);
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch (err) {
    console.warn('Could not store deleted ID', err);
  }
}

const VALID_PAGES = ['home', 'about', 'leadership', 'gallery', 'resources', 'projects', 'store', 'orders'];

function pageFromHash() {
  const p = (window.location.hash || '#home').replace('#', '');
  return VALID_PAGES.includes(p) ? p : 'home';
}

export default function App() {
  const { user, isEditor, loading: authLoading } = useAuth();

  const [page, setPage] = useState(pageFromHash());
  const [leaders, setLeaders] = useState(() => {
    const deleted = getDeletedIds(DELETED_LEADERS_KEY);
    return DEFAULT_LEADERS.filter(l => !isItemDeleted(l, deleted));
  });
  const [gallery, setGallery] = useState(DEFAULT_GALLERY);
  const [resources, setResources] = useState(DEFAULT_RESOURCES);
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [store, setStore] = useState(DEFAULT_STORE);
  const [faculty, setFaculty] = useState(() => {
    const deleted = getDeletedIds(DELETED_FACULTY_KEY);
    return DEFAULT_FACULTY.filter(f => !isItemDeleted(f, deleted));
  });
  const [orders, setOrders] = useState([]);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [seeded, setSeeded] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  // WordPress Customizer & Visual Edit Mode state
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customizerTab, setCustomizerTab] = useState('theme');
  const [visualEditMode, setVisualEditMode] = useState(false);

  const goTo = useCallback((p) => {
    const target = p === 'orders' && !isEditor ? 'home' : p;
    setPage(target);
    window.history.replaceState(null, '', `#${target}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [isEditor]);

  useEffect(() => {
    function onHashChange() {
      const h = (window.location.hash || '').toLowerCase();
      if (h === '#admin' || h === '#login') {
        setAdminLoginOpen(true);
      }
      setPage(pageFromHash());
    }
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keyboard shortcut: Ctrl+Shift+A (or Cmd+Shift+A) to access admin portal
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setAdminLoginOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Public content subscriptions — live for every visitor, editor or not.
  useEffect(() => {
    const received = { leaders: false, gallery: false, resources: false, projects: false, store: false, faculty: false };
    const unsubs = [
      subscribeCollection('leaders', {
        orderByField: 'order',
        onData: (items) => {
          if (items && (items.length > 0 || received.leaders)) {
            received.leaders = true;
            const deleted = getDeletedIds(DELETED_LEADERS_KEY);
            const filtered = items.filter(l => !isItemDeleted(l, deleted));
            setLeaders(filtered);
          }
        }
      }),
      subscribeCollection('faculty', {
        orderByField: 'order',
        onData: (items) => {
          if (items && (items.length > 0 || received.faculty)) {
            received.faculty = true;
            const deleted = getDeletedIds(DELETED_FACULTY_KEY);
            const filtered = items.filter(f => !isItemDeleted(f, deleted));
            setFaculty(filtered);
          }
        }
      }),
      subscribeCollection('gallery', {
        orderByField: 'order',
        onData: (items) => {
          if (items && (items.length > 0 || received.gallery)) {
            received.gallery = true;
            setGallery(items);
          }
        }
      }),
      subscribeCollection('resources', {
        onData: (items) => {
          if (items && (items.length > 0 || received.resources)) {
            received.resources = true;
            setResources(items);
          }
        }
      }),
      subscribeCollection('projects', {
        orderByField: 'order',
        onData: (items) => {
          if (items && (items.length > 0 || received.projects)) {
            received.projects = true;
            setProjects(items);
          }
        }
      }),
      subscribeCollection('store', {
        orderByField: 'order',
        onData: (items) => {
          if (items && (items.length > 0 || received.store)) {
            received.store = true;
            setStore(items);
          }
        }
      }),
      subscribeDoc('site/content', (data) => {
        if (data) setText((t) => ({ ...t, ...data }));
      }),
      subscribeDoc('site/settings', (data) => {
        if (data) {
          setSiteSettings((prev) => ({
            ...prev,
            ...data,
            theme: { ...prev.theme, ...(data.theme || {}) },
            header: { ...prev.header, ...(data.header || {}) },
            footer: { ...prev.footer, ...(data.footer || {}) },
            cards: { ...prev.cards, ...(data.cards || {}) }
          }));
        }
      })
    ];
    return () => unsubs.forEach((u) => u && u());
  }, []);

  // Orders are read-restricted to admins by firestore.rules, so only subscribe when editing.
  useEffect(() => {
    if (!isEditor) { setOrders([]); return; }
    const unsub = subscribeCollection('orders', { orderByField: 'createdAt', orderDirection: 'desc', onData: setOrders });
    return () => unsub && unsub();
  }, [isEditor]);

  // First-time seed: only a signed-in editor can write, and only runs once per browser
  useEffect(() => {
    if (isEditor && !seeded) {
      setSeeded(true);
      seedIfNeeded();
    }
  }, [isEditor, seeded]);

  // Sync body classes with editor state and visual edit mode
  useEffect(() => {
    document.body.classList.toggle('is-editor', !!isEditor);
    document.body.classList.toggle('has-wp-bar', !!isEditor);
    document.body.classList.toggle('visual-edit-mode', !!isEditor && visualEditMode);
  }, [isEditor, visualEditMode]);

  // Apply real-time customizer theme CSS variables to document root
  useEffect(() => {
    const t = siteSettings?.theme || DEFAULT_SITE_SETTINGS.theme;
    const root = document.documentElement;
    if (t.primaryColor) {
      root.style.setProperty('--navy-900', t.primaryColor);
      root.style.setProperty('--navy-950', t.darkColor || t.primaryColor);
    }
    if (t.secondaryColor) {
      root.style.setProperty('--navy-800', t.secondaryColor);
      root.style.setProperty('--blue-600', t.secondaryColor);
    }
    if (t.accentColor) {
      root.style.setProperty('--gold-500', t.accentColor);
    }
    if (t.accentGoldLight) {
      root.style.setProperty('--gold-400', t.accentGoldLight);
    }
    if (t.bgColor) {
      root.style.setProperty('--paper', t.bgColor);
      root.style.setProperty('--surface', t.bgColor);
    }
    if (t.inkColor) {
      root.style.setProperty('--ink-900', t.inkColor);
    }
    if (t.fontDisplay) {
      root.style.setProperty('--font-display', `'${t.fontDisplay}', Georgia, serif`);
    }
    if (t.fontBody) {
      root.style.setProperty('--font-body', `'${t.fontBody}', -apple-system, BlinkMacSystemFont, sans-serif`);
    }
    if (t.cardRadius) {
      root.style.setProperty('--radius-card', t.cardRadius);
    }
  }, [siteSettings.theme]);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: item.id, title: item.title, price: item.priceNum || 0, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c));
      return next.filter((c) => c.qty > 0);
    });
  }

  function clearCart() { setCart([]); }

  const handleDeleteLeader = useCallback(async (leaderOrId) => {
    const target = typeof leaderOrId === 'object' ? leaderOrId : leaders.find(l => l.id === leaderOrId);
    const id = target?.id || (typeof leaderOrId === 'string' ? leaderOrId : null);
    const name = target?.name;
    const position = target?.position || target?.role;
    if (id) addDeletedId(DELETED_LEADERS_KEY, id);
    if (name) addDeletedId(DELETED_LEADERS_KEY, name);

    // Optimistically update React state immediately
    const cleanId = id ? String(id).trim().toLowerCase() : null;
    const cleanName = name ? String(name).trim().toLowerCase() : null;
    setLeaders((prev) => prev.filter((l) => {
      const matchId = cleanId && (String(l.id || '').trim().toLowerCase() === cleanId);
      const matchName = cleanName && l.name && (String(l.name).trim().toLowerCase() === cleanName);
      return !matchId && !matchName;
    }));

    if (target?.photoPath) {
      deleteFile(target.photoPath).catch(() => {});
    }

    try {
      await deleteItem('leaders', target || { id, name, position });
    } catch (err) {
      console.warn('[db] Firestore deleteLeader warning:', err);
    }
  }, [leaders]);

  const handleSaveLeader = useCallback(async (leaderData, isEdit, originalItem) => {
    const targetId = leaderData.id || originalItem?.id;
    if (isEdit && targetId) {
      setLeaders(prev => prev.map(l => (l.id === targetId || l.name === originalItem?.name) ? { ...l, ...leaderData, id: targetId } : l));
      await updateItem('leaders', targetId, leaderData);
    } else {
      const added = await addItem('leaders', leaderData);
      setLeaders(prev => [...prev, { ...leaderData, id: added.id }]);
    }
  }, []);

  const handleDeleteFaculty = useCallback(async (facultyOrId) => {
    const target = typeof facultyOrId === 'object' ? facultyOrId : faculty.find(f => f.id === facultyOrId);
    const id = target?.id || (typeof facultyOrId === 'string' ? facultyOrId : null);
    const name = target?.name;
    const position = target?.position;
    if (id) addDeletedId(DELETED_FACULTY_KEY, id);
    if (name) addDeletedId(DELETED_FACULTY_KEY, name);

    // Optimistically update React state immediately
    const cleanId = id ? String(id).trim().toLowerCase() : null;
    const cleanName = name ? String(name).trim().toLowerCase() : null;
    setFaculty((prev) => prev.filter((f) => {
      const matchId = cleanId && (String(f.id || '').trim().toLowerCase() === cleanId);
      const matchName = cleanName && f.name && (String(f.name).trim().toLowerCase() === cleanName);
      return !matchId && !matchName;
    }));

    if (target?.photoPath) {
      deleteFile(target.photoPath).catch(() => {});
    }

    try {
      await deleteItem('faculty', target || { id, name, position });
    } catch (err) {
      console.warn('[db] Firestore deleteFaculty warning:', err);
    }
  }, [faculty]);

  const handleSaveFaculty = useCallback(async (facultyData, isEdit, originalItem) => {
    const targetId = facultyData.id || originalItem?.id;
    if (isEdit && targetId) {
      setFaculty(prev => prev.map(f => (f.id === targetId || f.name === originalItem?.name) ? { ...f, ...facultyData, id: targetId } : f));
      await updateItem('faculty', targetId, facultyData);
    } else {
      const added = await addItem('faculty', facultyData);
      setFaculty(prev => [...prev, { ...facultyData, id: added.id }]);
    }
  }, []);

  function handleOpenCustomizer(tab = 'theme') {
    setCustomizerTab(tab);
    setCustomizerOpen(true);
  }

  function handleOpenNewModal(type) {
    if (type === 'leader') goTo('leadership');
    else if (type === 'faculty') {
      goTo('home');
      setTimeout(() => {
        document.getElementById('faculty-lecturers')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
    else if (type === 'project') goTo('projects');
    else if (type === 'photo') goTo('gallery');
    else if (type === 'resource') goTo('resources');
    else if (type === 'store') goTo('store');
    else if (type === 'cards') handleOpenCustomizer('cards');
  }

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <>
      {/* WordPress Top Admin Toolbar (visible strictly to authenticated admin) */}
      {isEditor && (
        <WordPressAdminBar
          user={user}
          onSignOut={signOut}
          onOpenCustomizer={() => handleOpenCustomizer('theme')}
          onOpenNewModal={handleOpenNewModal}
          visualEditMode={visualEditMode}
          setVisualEditMode={setVisualEditMode}
        />
      )}

      {/* Main Navigation with dynamic brand, logo, and announcement bar */}
      <Nav
        page={page}
        goTo={goTo}
        isEditor={isEditor}
        user={user}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        siteSettings={siteSettings}
        onOpenCustomizer={handleOpenCustomizer}
      />

      {/* Page Views with WordPress Editable words, letters, and cards */}
      {page === 'home' && (
        <Home
          goTo={goTo}
          projects={projects}
          faculty={faculty}
          text={text}
          isEditor={isEditor}
          openProjectModal={setActiveProject}
          siteSettings={siteSettings}
          onOpenCustomizer={handleOpenCustomizer}
          onDeleteFaculty={handleDeleteFaculty}
          onSaveFaculty={handleSaveFaculty}
        />
      )}
      {page === 'about' && (
        <About
          goTo={goTo}
          text={text}
          isEditor={isEditor}
          leaders={leaders}
          siteSettings={siteSettings}
          onOpenCustomizer={handleOpenCustomizer}
        />
      )}
      {page === 'leadership' && (
        <Leadership
          leaders={leaders}
          isEditor={isEditor}
          text={text}
          siteSettings={siteSettings}
          onOpenCustomizer={handleOpenCustomizer}
          onDeleteLeader={handleDeleteLeader}
          onSaveLeader={handleSaveLeader}
        />
      )}
      {page === 'gallery' && (
        <Gallery gallery={gallery} isEditor={isEditor} />
      )}
      {page === 'resources' && (
        <Resources resources={resources} isEditor={isEditor} />
      )}
      {page === 'projects' && (
        <Projects projects={projects} isEditor={isEditor} openProjectModal={setActiveProject} />
      )}
      {page === 'store' && (
        <Store store={store} isEditor={isEditor} addToCart={addToCart} />
      )}
      {page === 'orders' && isEditor && (
        <Orders
          orders={orders}
          leaders={leaders}
          gallery={gallery}
          resources={resources}
          projects={projects}
          store={store}
          text={text}
        />
      )}

      {/* Global Modals & Drawers */}
      <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        changeQty={changeQty}
        clearCart={clearCart}
      />

      {/* Footer with dynamic branding, social links, contact info, and customizer shortcut */}
      <Footer
        goTo={goTo}
        isEditor={isEditor}
        user={user}
        siteSettings={siteSettings}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
        onOpenCustomizer={handleOpenCustomizer}
      />

      {/* WordPress Site Customizer Drawer */}
      <SiteCustomizer
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        settings={siteSettings}
        onUpdateSettings={setSiteSettings}
        initialTab={customizerTab}
      />

      {/* Admin Login Modal (opened via footer link, hash #admin/#login, or Ctrl+Shift+A) */}
      <AdminLoginModal
        open={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={() => setAdminLoginOpen(false)}
      />
    </>
  );
}
