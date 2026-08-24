# Phase 1: Landing Page + Sidebar Collapse/Responsive — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing-but-unused landing page (Home/About/Services/Contact) into the app's root route for unauthenticated visitors, and add a collapsible desktop sidebar plus a responsive-breakage audit across the authenticated app.

**Architecture:** Port five components (`Header`, `HomePage`→`Home`, `About`, `Service`→`Services`, `Contact`) from the dead `src/screens/Logins/` tree into a new `src/pages/public/landing/` folder, fixing the two things that don't work outside CRA (a `require()` image import, and a route link to a non-existent `/contact` page) and removing the duplicate-header bug caused by each section rendering its own `<Header />`. Then extend `AppSidebar`/`AppHeader`/`AppLayout` — which already share one collapsed-width token (`LAYOUT.sidebarCollapsedWidth`) that nothing currently uses — with a manual collapse toggle, persisted in `localStorage`. Finally, audit the authenticated pages at mobile/tablet widths and fix concrete overflow issues using the MUI breakpoint patterns already used in the codebase.

**Tech Stack:** React 18, Vite, MUI v6, react-router-dom v6, react-scroll (new dependency), react-slick + slick-carousel (new dependencies).

**Testing note:** This codebase has no automated test runner for React components (no Jest/Vitest/Testing Library in `package.json`) and adding one is out of scope for this plan. Every task's verification step is a manual check against the running dev server (`npm run dev`) with exact URLs, clicks, and expected outcomes — consistent with how the rest of the app is currently verified.

---

## Task 1: Add landing-page dependencies

**Files:**
- Modify: `package.json`, `package-lock.json` (via npm)

- [ ] **Step 1: Install dependencies**

Run: `npm install react-scroll react-slick slick-carousel`

Expected: `package.json` gains `react-scroll`, `react-slick`, `slick-carousel` under `dependencies`; command exits 0.

- [ ] **Step 2: Verify**

Run: `node -e "require('react-scroll'); require('react-slick'); require('slick-carousel'); console.log('ok')"`

Expected: prints `ok` with no error.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add react-scroll, react-slick, slick-carousel for landing page"
```

---

## Task 2: Port landing page stylesheets

**Files:**
- Create: `src/pages/public/landing/styles/header.css`
- Create: `src/pages/public/landing/styles/homepage.css`
- Create: `src/pages/public/landing/styles/about.css`
- Create: `src/pages/public/landing/styles/service.css`
- Create: `src/pages/public/landing/styles/contact.css`
- Create: `src/pages/public/landing/styles/landing.css`

These are copied unmodified from the legacy, unused `src/screens/Logins/LoginsStyle/` tree — no content changes, just relocated next to the components that will use them.

- [ ] **Step 1: Create the destination folder and copy the files**

```bash
mkdir -p "src/pages/public/landing/styles"
cp "src/screens/Logins/LoginsStyle/header.css" "src/pages/public/landing/styles/header.css"
cp "src/screens/Logins/LoginsStyle/homepage.css" "src/pages/public/landing/styles/homepage.css"
cp "src/screens/Logins/LoginsStyle/about.css" "src/pages/public/landing/styles/about.css"
cp "src/screens/Logins/LoginsStyle/service.css" "src/pages/public/landing/styles/service.css"
cp "src/screens/Logins/LoginsStyle/contact.css" "src/pages/public/landing/styles/contact.css"
cp "src/screens/Logins/LoginsStyle/LandingPage.css" "src/pages/public/landing/styles/landing.css"
```

- [ ] **Step 2: Verify**

Run: `ls src/pages/public/landing/styles`

Expected: lists all six files above.

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/landing/styles
git commit -m "Copy legacy landing page stylesheets into new landing folder"
```

---

## Task 3: Create the ported Header component

**Files:**
- Create: `src/pages/public/landing/Header.jsx`

This replaces the legacy `src/screens/Logins/Header.jsx`. Two fixes applied: the CRA-style `require()` image import becomes an ES `import`, and the "Login" nav item becomes a real `react-router-dom` `Link` to `/login` instead of scroll-spying to an embedded sign-in form (that embedded form is not part of this composition — see Task 8).

- [ ] **Step 1: Create the file**

```jsx
import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../Images/tut.png";
import "./styles/header.css";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const isSignInPage = location.pathname === "/login";

  return (
    <div id="header" className={scrolled ? "header-scrolled" : ""}>
      <nav className="navbar">
        <div className="navbar-brand">
          <img
            src={logo}
            alt="logo"
            className="logos"
            height={70}
            onClick={() => navigate("/")}
          />
        </div>

        {!isSignInPage && (
          <>
            <div className="hamburger-menu" onClick={toggleMenu}>
              <span className="hamburger-icon">&#9776;</span>
            </div>

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
              <ScrollLink
                to="home"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/");
                }}
              >
                Home
              </ScrollLink>
              <ScrollLink
                to="about"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                About
              </ScrollLink>
              <ScrollLink
                to="services"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                Service
              </ScrollLink>
              <Link to="/login" className="nav_button" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <ScrollLink
                to="contact"
                spy={true}
                smooth={true}
                offset={-100}
                duration={200}
                activeClass="active"
                className="nav_button"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </ScrollLink>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

export default Header;
```

- [ ] **Step 2: Verify**

Run: `node -e "require('fs').accessSync('src/pages/public/landing/Header.jsx'); console.log('ok')"`

Expected: prints `ok`. (Full functional verification happens in Task 10 once the whole page is wired up — this component can't run standalone since it needs a Router context.)

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/landing/Header.jsx
git commit -m "Port landing page Header component to Vite"
```

---

## Task 4: Create the ported Home component

**Files:**
- Create: `src/pages/public/landing/Home.jsx`

Ported from `src/screens/Logins/HomePage.jsx`. The only change: it no longer renders its own `<Header />` — `LandingPage.jsx` (Task 8) renders the header once for the whole composed page instead of once per section.

- [ ] **Step 1: Create the file**

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/homepage.css";

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-container">
      <div className={`hero-content ${isLoaded ? "animate-slide-up" : ""}`}>
        <div className="first-title">
          <p>
            Your First Step to Seamless
            <br />
            Resolutions.
          </p>
        </div>
        <div className="second-title">
          <p>
            Ensure that every technical problem is handled effortlessly. Keep your work
            <br />
            environment running smoothly.
          </p>
        </div>
        <div className="home-button">
          <Link to="/login">
            <button className="start-button">Get Started</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
```

- [ ] **Step 2: Verify**

Run: `node -e "require('fs').accessSync('src/pages/public/landing/Home.jsx'); console.log('ok')"`

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/landing/Home.jsx
git commit -m "Port landing page Home section to Vite"
```

---

## Task 5: Create the ported About component

**Files:**
- Create: `src/pages/public/landing/About.jsx`

Ported from `src/screens/Logins/About.jsx`. Changes: no self-rendered `<Header />`; the `require()` image import becomes an ES import; the "Contact us" button previously linked to a `/contact` route that does not exist anywhere in `App.jsx` (it would fall through to the catch-all redirect) — it now scroll-spies to the `#contact` section on this same page, using the same `react-scroll` pattern as the nav.

- [ ] **Step 1: Create the file**

```jsx
import { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import aboutPicture from "../../../Images/aboutPicture.jpg";
import "./styles/about.css";

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const aboutSection = document.querySelector(".about-section");
    if (aboutSection) {
      observer.observe(aboutSection);
    }

    return () => {
      if (aboutSection) {
        observer.unobserve(aboutSection);
      }
    };
  }, []);

  return (
    <div className="about-container">
      <div className={`about-section ${isVisible ? "animate-fade-in" : ""}`}>
        <div className="about-header">
          <h1>ABOUT US</h1>
          <div className="underline"></div>
        </div>

        <div className="about-content-wrapper">
          <div className="about-picture animate-slide-in-left">
            <img src={aboutPicture} alt="Welcome" className="about-img animated-img" />
          </div>

          <div className="about-content animate-slide-in-right">
            <h2>
              We Are All About Smarter And
              <br />
              Faster Solutions.
            </h2>
            <p>
              Welcome to FixFlow Support, your dedicated partner in ensuring the smooth and efficient operation of
              your technology infrastructure. We specialize in providing expert technical assistance to businesses and
              institutions, addressing technical challenges swiftly and effectively.
              <br />
              <br />
              Our team consists of highly trained professionals, all working collaboratively to provide top-tier
              support. We understand the critical role that technology plays in your daily operations, and our mission
              is to deliver solutions that minimize downtime and maximize system performance.
              <br />
              <br />
              With a focus on reliability, responsiveness, and innovation, FixFlow Support is here to keep your
              systems running seamlessly, so you can focus on what you do best.
              <br />
              <br />
              We are here to help you every step of the way.
            </p>

            <ScrollLink to="contact" spy={true} smooth={true} offset={-100} duration={200}>
              <button className="contact-Us">Contact us</button>
            </ScrollLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
```

- [ ] **Step 2: Verify**

Run: `node -e "require('fs').accessSync('src/pages/public/landing/About.jsx'); console.log('ok')"`

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/landing/About.jsx
git commit -m "Port landing page About section to Vite"
```

---

## Task 6: Create the ported Services component

**Files:**
- Create: `src/pages/public/landing/Services.jsx`

Ported from `src/screens/Logins/Service.jsx` (renamed `Services` to avoid colliding with the `services` API module already imported elsewhere in the app as `services`). No behavior change beyond the ES image imports.

- [ ] **Step 1: Create the file**

```jsx
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import service1 from "../../../Images/service1.jpg";
import service2 from "../../../Images/service2.jpg";
import service3 from "../../../Images/service3.jpg";
import service4 from "../../../Images/service4.jpg";
import "./styles/service.css";

const Services = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="service-container">
      <h1 className="under">SERVICES</h1>
      <p className="centered-text">
        FixFlow offers a comprehensive suite of services designed to streamline technical support across your
      </p>
      <p className="centered-text">
        organization. From issue logging to resolution tracking, our platform ensures that every technical challenge
      </p>
      <p className="centered-text">is handled efficiently.</p>

      <Slider {...settings} className="images-container">
        <div className="image-item">
          <img src={service1} alt="Service 1" className="service-image" />
          <p className="image-caption">Issue Logging and Reporting</p>
          <p className="centered-caption">Easily log and report technical issues</p>
          <p className="centered-caption">through a user-friendly form.</p>
        </div>
        <div className="image-item">
          <img src={service2} alt="Service 2" className="service-image" />
          <p className="image-caption">Technician Assignment</p>
          <p className="centered-caption">Get the right technicians based on their</p>
          <p className="centered-caption">expertise.</p>
        </div>
        <div className="image-item">
          <img src={service3} alt="Service 3" className="service-image" />
          <p className="image-caption">Real-Time Issue Tracking</p>
          <p className="centered-caption">Track the status of reported</p>
          <p className="centered-caption">issues in real-time, with updates</p>
          <p className="centered-caption">provided at every stage of the</p>
          <p className="centered-caption">resolution process.</p>
        </div>
        <div className="image-item">
          <img src={service4} alt="Service 4" className="service-image" />
          <p className="image-caption">Collaborations</p>
          <p className="centered-caption">Collaborate in real-time, sharing insights</p>
          <p className="centered-caption">and working together to resolve issues</p>
          <p className="centered-caption">more efficiently.</p>
        </div>
      </Slider>
    </div>
  );
};

export default Services;
```

- [ ] **Step 2: Verify**

Run: `node -e "require('fs').accessSync('src/pages/public/landing/Services.jsx'); console.log('ok')"`

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/landing/Services.jsx
git commit -m "Port landing page Services section to Vite"
```

---

## Task 7: Create the ported Contact component

**Files:**
- Create: `src/pages/public/landing/Contact.jsx`

Ported from `src/screens/Logins/Contact.jsx`. Only change: ES image imports. The form still just logs to console on submit (no backend contact-form endpoint exists) — unchanged from the legacy behavior, since wiring a real contact-form submission is outside this batch's scope.

- [ ] **Step 1: Create the file**

```jsx
import { useState } from "react";
import messageIcon from "../../../Images/message.jpg";
import locationIcon from "../../../Images/location.jpg";
import phoneIcon from "../../../Images/phone.jpg";
import "./styles/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title animate-fade-in">Contact Us</h1>
      <div className="content">
        <form className="contact-form animate-slide-in-left" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Your name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Your valid email address"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              className="textareas form-input"
              placeholder="Message"
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <button type="submit" className="contact-button">
            Submit
          </button>
        </form>

        <div className="contact-details animate-slide-in-right">
          <div className="contact-item">
            <img src={messageIcon} alt="Chat" className="contact-image" />
            <div className="contact-message">
              <p>
                Chat to us
                <br />
                Our friendly team is here to help: <span className="color-email">help@fixflow.com</span>
              </p>
            </div>
          </div>

          <div className="contact-item">
            <img src={locationIcon} alt="Location" className="contact-image" />
            <div className="contact-message">
              <p>
                Office location
                <br />
                Soshanguve Campus, Building 10
              </p>
            </div>
          </div>

          <div className="contact-item">
            <img src={phoneIcon} alt="Phone" className="contact-image" />
            <div className="contact-message">
              <p>
                Call us
                <br />
                012 985 9636
                <br />
                Mon-Fri from 8am-4pm
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer animate-fade-in">
        <span>© Copyright FixFlow All Rights Reserved</span>
      </div>
    </div>
  );
};

export default Contact;
```

- [ ] **Step 2: Verify**

Run: `node -e "require('fs').accessSync('src/pages/public/landing/Contact.jsx'); console.log('ok')"`

Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/landing/Contact.jsx
git commit -m "Port landing page Contact section to Vite"
```

---

## Task 8: Compose the LandingPage and wire it into routing

**Files:**
- Create: `src/pages/public/landing/LandingPage.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the composed landing page**

```jsx
import Header from "./Header.jsx";
import Home from "./Home.jsx";
import About from "./About.jsx";
import Services from "./Services.jsx";
import Contact from "./Contact.jsx";
import "./styles/landing.css";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <div className="main-contain">
        <div id="home">
          <Home />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="services">
          <Services />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Import LandingPage in App.jsx**

In `src/App.jsx`, add this import after the existing `admin` imports block (after line 48, before the `reports` imports comment):

```jsx
// public
import LandingPage from './pages/public/landing/LandingPage.jsx';
```

- [ ] **Step 3: Add a PublicLanding wrapper next to RootRedirect**

In `src/App.jsx`, immediately after the existing `RootRedirect` function (after its closing `}` on line 61), add:

```jsx
/** "/" for a guest is the marketing site; for a signed-in user it's their home. */
function PublicLanding() {
  const { isAuthenticated, loading, homePath } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to={homePath} replace />;
  return <LandingPage />;
}
```

- [ ] **Step 4: Point the root route at PublicLanding**

In `src/App.jsx`, find:

```jsx
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
```

Replace with:

```jsx
      <Route path="/" element={<PublicLanding />} />
      <Route path="*" element={<RootRedirect />} />
```

(The catch-all for unknown paths keeps redirecting straight to `/login`/home — only the exact `/` route now shows the landing page.)

- [ ] **Step 5: Verify the app still builds**

Run: `npm run build`

Expected: exits 0 with a `dist/` output and no errors (Vite will fail loudly on a broken import or unresolved module, which is the main risk after this many new files).

- [ ] **Step 6: Commit**

```bash
git add src/pages/public/landing/LandingPage.jsx src/App.jsx
git commit -m "Wire landing page into the root route for unauthenticated visitors"
```

---

## Task 9: Manually verify the landing page end-to-end

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (leave running)

- [ ] **Step 2: Verify guest landing**

In a browser where you are NOT logged in (or after clearing the app's auth state), visit `http://localhost:3000/`.

Expected: the landing page renders — hero section, then About, Services carousel, Contact form — not a redirect to `/login`.

- [ ] **Step 3: Verify nav scroll-spy**

Click "About", "Service", "Contact" in the header nav.

Expected: page smooth-scrolls to each section; the corresponding nav link gets the `active` class while that section is in view.

- [ ] **Step 4: Verify Login routes correctly**

Click "Login" in the header nav, and separately click "Get Started" on the hero.

Expected: both navigate to `/login` and render the real sign-in form (`src/pages/auth/SignIn.jsx`); the header's nav links disappear on that page (existing `isSignInPage` behavior).

- [ ] **Step 5: Verify About's "Contact us" button**

Scroll to the About section and click "Contact us".

Expected: smooth-scrolls down to the Contact section (does not attempt to navigate to a `/contact` route).

- [ ] **Step 6: Verify mobile nav**

Resize the browser to under ~480px wide (or use device emulation).

Expected: the hamburger icon appears and toggles the nav links open/closed; no layout overflow.

- [ ] **Step 7: Verify authenticated users skip the landing page**

Log in, then navigate to `http://localhost:3000/` directly.

Expected: immediately redirected to your role's dashboard (e.g. `/staff`), landing page never shown.

- [ ] **Step 8: Fix anything broken**

If any step above fails, fix the specific file involved before proceeding — do not move to Task 10 with a known-broken landing page.

---

## Task 10: Add sidebar collapse/expand support

**Files:**
- Modify: `src/layout/AppSidebar.jsx`
- Modify: `src/layout/AppHeader.jsx`
- Modify: `src/layout/AppLayout.jsx`

`LAYOUT.sidebarCollapsedWidth` (`72`, in `src/theme/tokens.js:91`) already exists and is unused — this task is what finally uses it.

- [ ] **Step 1: Replace the full contents of AppSidebar.jsx**

```jsx
/**
 * src/layout/AppSidebar.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Renders navigation.js for whoever is signed in. Replaces four hand-written
 *   sidebars and the ~40 duplicated PNG icons they depended on.
 *
 * WHAT IT ACHIEVES
 *   A single dark-teal rail carrying the brand. Active state is derived from the
 *   router, so it cannot fall out of sync with the URL — the old sidebars tracked
 *   the selected item in local state, which meant using the browser back button
 *   left the wrong item highlighted.
 *
 *   Desktop users can also collapse it to an icon-only rail (LAYOUT.sidebarCollapsedWidth) via
 *   the chevron in the brand row; the choice is remembered in localStorage by AppLayout.
 */
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, IconButton, Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../auth/AuthContext.jsx';
import { navigationFor } from './navigation.js';
import { LAYOUT, PRIMARY } from '../theme/tokens.js';

function SidebarContent({ onNavigate, collapsed = false, isDesktop = false, onToggleCollapse }) {
  const { user, roles, homePath } = useAuth();
  const location = useLocation();
  const groups = navigationFor(roles);

  const base = homePath;
  const initials = (user?.initials || user?.surname || '?').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: PRIMARY.main, color: '#fff' }}>
      {/* Brand */}
      <Box sx={{ height: LAYOUT.headerHeight, display: 'flex', alignItems: 'center', gap: 1.5, px: collapsed ? 1.5 : 2.5, flexShrink: 0 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: 'secondary.main', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          T
        </Box>
        {!collapsed && (
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.01em', flexGrow: 1 }}>
            Techtrackers
          </Typography>
        )}
        {isDesktop && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              sx={{
                color: 'rgba(255,255,255,0.72)',
                ml: collapsed ? 0 : 'auto',
                '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.09)' }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1 : 1.5, py: 2 }}>
        {groups.map(({ section, items }) => (
          <Box key={section || 'main'} sx={{ mb: 2 }}>
            {section && !collapsed && (
              <Typography
                variant="overline"
                sx={{ px: 1.5, color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', display: 'block', mb: 0.5 }}
              >
                {section}
              </Typography>
            )}
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {items.map((item) => {
                const to = item.to ? `${base}/${item.to}` : base;
                const active = item.exact
                  ? location.pathname === to
                  : location.pathname === to || location.pathname.startsWith(`${to}/`);

                const button = (
                  <ListItemButton
                    component={NavLink}
                    to={to}
                    end={item.exact}
                    onClick={onNavigate}
                    selected={active}
                    sx={{
                      minHeight: 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                      backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' },
                      '&.Mui-selected:hover': { backgroundColor: 'rgba(255,255,255,0.16)' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: collapsed ? 0 : 34, color: 'inherit', justifyContent: 'center' }}>
                      <item.icon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500 }}
                      />
                    )}
                  </ListItemButton>
                );

                return collapsed ? (
                  <Tooltip key={to} title={item.label} placement="right">
                    {button}
                  </Tooltip>
                ) : (
                  <Box key={to}>{button}</Box>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Signed-in user */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.8125rem', fontWeight: 600 }}>
          {initials}
        </Avatar>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {user?.name ?? 'Signed in'}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
              {roles[0]?.replace('_', ' ').toLowerCase() ?? ''}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function AppSidebar({ isDesktop, open, onClose, collapsed = false, onToggleCollapse }) {
  if (isDesktop) {
    const width = collapsed ? LAYOUT.sidebarCollapsedWidth : LAYOUT.sidebarWidth;
    return (
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': { width, borderRight: 'none', overflowX: 'hidden', transition: 'width 0.2s ease' },
        }}
      >
        <SidebarContent collapsed={collapsed} isDesktop onToggleCollapse={onToggleCollapse} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: LAYOUT.sidebarWidth, borderRight: 'none' } }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>
  );
}
```

- [ ] **Step 2: Give AppHeader a `sidebarWidth` prop**

In `src/layout/AppHeader.jsx`, change the function signature (currently `export default function AppHeader({ onMenuClick, isDesktop }) {`) to:

```jsx
export default function AppHeader({ onMenuClick, isDesktop, sidebarWidth = LAYOUT.sidebarWidth }) {
```

Then, in the same file, find the `AppBar`'s `sx` prop:

```jsx
      sx={{
        width: { lg: `calc(100% - ${LAYOUT.sidebarWidth}px)` },
        ml: { lg: `${LAYOUT.sidebarWidth}px` },
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${NEUTRAL[100]}`,
        color: 'text.primary',
      }}
```

Replace with:

```jsx
      sx={{
        width: { lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { lg: `${sidebarWidth}px` },
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${NEUTRAL[100]}`,
        color: 'text.primary',
        transition: 'width 0.2s ease, margin-left 0.2s ease',
      }}
```

- [ ] **Step 3: Manage collapse state in AppLayout**

Replace the full contents of `src/layout/AppLayout.jsx` with:

```jsx
/**
 * src/layout/AppLayout.jsx
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The old app had four complete dashboard shells — one per role — each with
 *   its own sidebar, header, CSS and routing. They drifted: the admin header had
 *   a search box the others lacked, the HOD sidebar didn't collapse, only the
 *   technician one showed a notification badge. Same product, four experiences.
 *
 * WHAT IT ACHIEVES
 *   ONE shell for every role. What differs between roles is only which nav items
 *   appear, which is a filter over navigation.js — not a different component.
 *
 *   Also fixes the responsive behaviour: the old sidebars were fixed-width divs
 *   that simply overlapped the content on a phone. Here the drawer is permanent
 *   on desktop and a temporary overlay on mobile, which is the standard pattern
 *   users already understand. Desktop users can further collapse the permanent
 *   drawer to an icon rail; that choice is remembered across reloads.
 */
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import AppSidebar from './AppSidebar.jsx';
import AppHeader from './AppHeader.jsx';
import { LAYOUT } from '../theme/tokens.js';

const COLLAPSE_STORAGE_KEY = 'techtrackers:sidebar-collapsed';

export default function AppLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true',
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const sidebarWidth = isDesktop && collapsed ? LAYOUT.sidebarCollapsedWidth : LAYOUT.sidebarWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppSidebar
        isDesktop={isDesktop}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={isDesktop && collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,   // lets wide tables scroll instead of stretching the page
          width: { lg: `calc(100% - ${sidebarWidth}px)` },
          transition: 'width 0.2s ease',
        }}
      >
        <AppHeader onMenuClick={() => setMobileOpen(true)} isDesktop={isDesktop} sidebarWidth={sidebarWidth} />
        {/* Spacer matching the fixed header, so content starts below it. */}
        <Toolbar sx={{ minHeight: `${LAYOUT.headerHeight}px !important` }} />

        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1440, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 4: Verify the app still builds**

Run: `npm run build`

Expected: exits 0, no errors.

- [ ] **Step 5: Commit**

```bash
git add src/layout/AppSidebar.jsx src/layout/AppHeader.jsx src/layout/AppLayout.jsx
git commit -m "Add collapsible desktop sidebar with persisted state"
```

---

## Task 11: Manually verify sidebar collapse and mobile drawer

**Files:** none (verification only)

- [ ] **Step 1: Verify desktop collapse**

With `npm run dev` running, log in and resize the browser above the `lg` breakpoint (≥1200px). Click the chevron in the sidebar's brand row.

Expected: sidebar shrinks to an icon-only rail; hovering an icon shows a tooltip with its label; the main content area and top header both resize to fill the freed space (no gap, no overlap).

- [ ] **Step 2: Verify collapse persists**

Reload the page.

Expected: sidebar stays collapsed (state read from `localStorage` on mount). Click the chevron again to expand, reload again, and confirm it stays expanded.

- [ ] **Step 3: Verify nav still works collapsed**

While collapsed, click each icon.

Expected: navigation still works, active item is still visually indicated (background highlight), no console errors.

- [ ] **Step 4: Verify mobile is unaffected**

Resize below 1200px (or use device emulation) with the sidebar previously left collapsed.

Expected: desktop permanent drawer disappears; hamburger button appears in the header; clicking it opens the full-width temporary drawer (not the icon rail) — mobile always shows full labels regardless of the desktop collapsed flag.

- [ ] **Step 5: Fix anything broken**

If any step fails, fix it in `AppSidebar.jsx`/`AppHeader.jsx`/`AppLayout.jsx` before proceeding.

---

## Task 12: Responsive audit of the authenticated app

**Files:** modified as needed based on findings (see remediation patterns below)

This is a manual audit, not a pre-scripted change — the specific breakage, if any, isn't known until you look. Two remediation patterns cover the great majority of responsive bugs in an MUI app; apply whichever matches what you find:

- **Horizontal overflow** (a table or wide content pushes the viewport wider than the screen): wrap the offending element in `<Box sx={{ overflowX: 'auto' }}>` so it scrolls internally instead of stretching the page — the same technique already relied on via `minWidth: 0` on `AppLayout`'s main content box.
- **Cramped grid at small widths** (fields or cards squeezed together below `md`): add/adjust the `xs`/`sm`/`md` breakpoints on the relevant `<Grid item>`, following the existing pattern in `src/pages/staff/LogIssue.jsx` (e.g. `<Grid item xs={12} sm={6}>` — full width on phones, half width from `sm` up).

- [ ] **Step 1: Audit each page at three widths**

With `npm run dev` running and logged in as a role that can reach these pages, open browser dev tools' device toolbar and check each of the following at 375px (phone), 768px (tablet), and 1280px (desktop):

- `/staff` (StaffDashboard) and `/staff/log-issue` (LogIssue)
- `/admin` (RoleDashboard) and `/admin/tickets` (TicketList)
- `/admin/tickets/:id` — open any existing ticket (TicketDetail)
- `/technician` and `/technician/collaborations`
- `/admin/reports` (ReportsOverview) and `/admin/reports/sla` (SlaComplianceReport)
- `/admin/users` (UsersAdmin)

For each, check: no horizontal scrollbar on the page itself, no overlapping text/buttons, dialogs (AssignDialog, CollaborationDialog) fit within the viewport without needing to scroll the whole page sideways, and the sidebar/header behave per Tasks 10-11 at every width.

- [ ] **Step 2: Record and fix findings**

For each page where something breaks, note the exact page + width + symptom, then apply the matching remediation pattern from above directly in that page's file.

- [ ] **Step 3: Re-verify fixed pages**

Re-check every page you modified at all three widths again to confirm the fix didn't regress a different width.

- [ ] **Step 4: Verify the app still builds**

Run: `npm run build`

Expected: exits 0, no errors.

- [ ] **Step 5: Commit**

If fixes were needed:

```bash
git add -A
git commit -m "Fix responsive layout issues found in mobile/tablet audit"
```

If the audit found nothing to fix, skip the commit — there's nothing to commit, and an empty commit would misrepresent this task as having changed something.

---

## Task 13: Phase 1 wrap-up

**Files:** none

- [ ] **Step 1: Full regression pass**

Run through Task 9 (landing page) and Task 11 (sidebar) verification steps once more in a single session to confirm nothing in Task 12's fixes broke either.

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Confirm**

Run: `git log --oneline -15` and `git status`

Expected: all Phase 1 commits present, branch up to date with its remote, clean working tree.

Phase 1 is complete once this task's steps pass. Phase 2 (mandatory live location + invite-technician verification) is planned separately once this phase is confirmed working.
