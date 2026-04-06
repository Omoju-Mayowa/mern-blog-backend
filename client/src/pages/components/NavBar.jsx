import React, { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import Logo from "../images/logo.png";
import { FaBars, FaPalette } from "react-icons/fa";
import { PiMoonStarsFill, PiPalette, PiPaletteFill, PiSunHorizonFill } from "react-icons/pi";
import { TbSpacingVertical } from "react-icons/tb";
import { AiOutlineClose } from "react-icons/ai";
import { BsCheckLg, BsPalette, BsPalette2 } from "react-icons/bs";
import { motion, AnimatePresence } from "motion/react";
import { UserContext } from "./context/userContext";
import { useTheme } from "./context/themeContext";
import { getAccentColor, ACCENT_NAMES } from "./accentConfig";
import { CARD_DEFAULT_ORDER, CARD_SECTION_LABELS } from "./postLayoutConstants";
import usePostStream from "./usePostStream";

const scrollTop = () => window.scrollTo(0, 0);
const BREAKPOINT = 1200;

const CARD_PRESETS = {
  classic: {
    label: "Classic",
    desc: "Standard top-down layout",
    order: ["thumbnail", "title", "description", "footer"],
  },
  editorial: {
    label: "Editorial",
    desc: "Author visible before description",
    order: ["thumbnail", "title", "footer", "description"],
  },
};

const ParticleBurst = ({ active, color = "#6f6af8", count = 8 }) => {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (360 / count) * i,
      dist: 16 + Math.random() * 10,
    })),
  );
  return (
    <AnimatePresence>
      {active && (
        <span style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: Math.cos(rad) * p.dist, y: Math.sin(rad) * p.dist, scale: 0, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.55, ease: [0.2, 0, 0.8, 1] }}
                style={{
                  position: "absolute", top: "50%", left: "50%",
                  width: "4px", height: "4px", borderRadius: "50%",
                  background: color, marginTop: "-2px", marginLeft: "-2px",
                  pointerEvents: "none",
                }}
              />
            );
          })}
        </span>
      )}
    </AnimatePresence>
  );
};

const Header = () => {
  const [isNavShowing, setIsNavShowing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINT);
  const [showCustomize, setShowCustomize] = useState(false);
  const [activeTab, setActiveTab] = useState("colors");
  const [pendingAccent, setPendingAccent] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [modeBurst, setModeBurst] = useState(false);
  const [densityBurst, setDensityBurst] = useState(false);

  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  const { currentUser, setCurrentUser, cardOrder, updateCardOrder, resetCardOrder } = useContext(UserContext);
  const { colorMode, toggleColorMode, density, cycleDensity, accent, cycleAccent, accents } = useTheme();

  const accentList = accents && accents.length > 0 ? accents : ACCENT_NAMES;
  const isDark = colorMode === "dark";
  const burstColor = getAccentColor(accent);

  const modalBg      = isDark ? "#13132b" : "#ffffff";
  const modalText    = isDark ? "#f0f0ff" : "#0c0c22";
  const modalSubtext = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)";
  const modalBorder  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const btnBorder    = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const btnBg        = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const cardBg       = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const cardBorder   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const labelColor   = isDark ? "#c8c8e8" : "#252542";
  const tabBg        = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tabActiveBg  = isDark ? "#1e1e40" : "#ffffff";
  const dragRowBg    = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const dragRowBorder= isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const fireBurst = (setter) => { setter(true); setTimeout(() => setter(false), 600); };

  usePostStream((event, payload) => {
    if (event === "profile_updated" && currentUser && String(payload._id) === String(currentUser.id)) {
      setCurrentUser((prev) => ({ ...prev, name: payload.name, avatar: payload.avatar, email: payload.email }));
    }
  });

  useEffect(() => {
    const handleResize = () => {
      const m = window.innerWidth <= BREAKPOINT;
      setIsMobile(m);
      if (!m) setIsNavShowing(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector("nav");
      if (nav) nav.classList.toggle("scroll", window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isMobile && isNavShowing) || showCustomize ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, isNavShowing, showCustomize]);

  const openCustomize = (tab = "colors") => {
    setPendingAccent(accent);
    setPendingOrder([...cardOrder]);
    setActiveTab(tab);
    setShowCustomize(true);
  };

  const closeCustomize = () => {
    setPendingAccent(null);
    setPendingOrder(null);
    setShowCustomize(false);
  };

  const saveAll = () => {
    if (pendingAccent && pendingAccent !== accent) {
      const from = accentList.indexOf(accent), to = accentList.indexOf(pendingAccent);
      const steps = (((to - from) % accentList.length) + accentList.length) % accentList.length;
      for (let i = 0; i < steps; i++) cycleAccent();
    }
    if (pendingOrder) updateCardOrder(pendingOrder);
    closeCustomize();
  };

  const handleModalDragStart = (i) => { dragItem.current = i; };
  const handleModalDragEnter = (i) => { dragOverItem.current = i; };
  const handleModalDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      dragItem.current = dragOverItem.current = null; return;
    }
    const next = [...pendingOrder];
    const [moved] = next.splice(dragItem.current, 1);
    next.splice(dragOverItem.current, 0, moved);
    dragItem.current = dragOverItem.current = null;
    setPendingOrder(next);
  };

  const handleToggleMode = () => { fireBurst(setModeBurst); toggleColorMode(); };
  const handleCycleDensity = () => { fireBurst(setDensityBurst); cycleDensity(); };

  // ── Link definitions ───────────────────────────────────────────────────
  const publicLinks = [
    { name: "Popular", label: "Popular", path: "/popular" },
    { name: "Search",  label: "Search",  path: "/search"  },
    { name: "Authors", label: "Authors", path: "/authors" },
  ]

  const authLinks = [
    { name: currentUser?.name, label: `Hey, ${currentUser?.name} 👋`, path: `/profile/${currentUser?.id}` },
    { name: "My Posts",    label: "My Posts",    path: "/dashboard" },
    { name: "Create Post", label: "Create Post", path: "/create"    },
    { name: "Logout",      label: "Logout",      path: "/logout"    },
  ]

  const guestLinks = [
    { name: "Login", label: "Login", path: "/login" },
  ]

  const desktopLinks = currentUser
    ? [...publicLinks, ...authLinks]
    : [...publicLinks, ...guestLinks]

  const sheetLinks = currentUser
    ? [...publicLinks, ...authLinks.filter(l => l.name !== "Create Post")]
    : [...publicLinks, ...guestLinks]

  const closeNav     = () => setIsNavShowing(false);
  const densityLabel = { comfortable: "Comfortable", compact: "Compact", spacious: "Spacious" };

  // ── Theme buttons ──────────────────────────────────────────────────────
  const ThemeButtons = ({ inSheet = false }) => (
    <>
      <motion.button className={inSheet ? "nav__sheet-theme-btn" : "nav__theme-btn"}
        onClick={handleToggleMode} whileTap={{ scale: 0.8 }} whileHover={!inSheet ? { scale: 1.12 } : {}}
        title={isDark ? "Light mode" : "Dark mode"} style={{ position: "relative", overflow: "visible" }}
      >
        <AnimatePresence>
          {modeBurst && (
            <motion.span key="mode-ring" initial={{ scale: 0.3, opacity: 0.85 }} animate={{ scale: 2.8, opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
                background: isDark ? "radial-gradient(circle,#ffd70077 0%,transparent 70%)" : `radial-gradient(circle,${burstColor}44 0%,transparent 70%)` }}
            />
          )}
        </AnimatePresence>
        <ParticleBurst active={modeBurst} color={isDark ? "#ffd700" : burstColor} count={7} />
        <AnimatePresence mode="wait">
          {!isDark ? (
            <motion.span key="moon" initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.4, opacity: 0 }} transition={{ type: "spring", stiffness: 440, damping: 22 }} style={{ display: "flex" }}>
              <PiMoonStarsFill />
            </motion.span>
          ) : (
            <motion.span key="sun" initial={{ rotate: 90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.4, opacity: 0 }} transition={{ type: "spring", stiffness: 440, damping: 22 }} style={{ display: "flex" }}>
              <PiSunHorizonFill />
            </motion.span>
          )}
        </AnimatePresence>
        {inSheet && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
      </motion.button>

      <motion.button className={inSheet ? "nav__sheet-theme-btn" : "nav__theme-btn"}
        onClick={handleCycleDensity} whileTap={{ scale: 0.8 }} whileHover={!inSheet ? { scale: 1.12 } : {}}
        title={`Layout: ${densityLabel[density]}`} style={{ position: "relative", overflow: "visible" }}
      >
        <AnimatePresence>
          {densityBurst && (
            <motion.span key="density-ring" initial={{ scale: 0.3, opacity: 0.85 }} animate={{ scale: 2.8, opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none",
                background: `radial-gradient(circle,${burstColor}55 0%,transparent 70%)` }}
            />
          )}
        </AnimatePresence>
        <ParticleBurst active={densityBurst} color={burstColor} count={6} />
        <AnimatePresence mode="wait">
          <motion.span key={density} initial={{ rotate: -35, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 35, scale: 0.5, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 20 }} style={{ display: "flex" }}>
            <TbSpacingVertical />
          </motion.span>
        </AnimatePresence>
        {inSheet && <span>{densityLabel[density]}</span>}
      </motion.button>

      <motion.button className={inSheet ? "nav__sheet-theme-btn" : "nav__theme-btn nav__theme-btn--accent"}
        onClick={() => openCustomize("colors")} whileTap={{ scale: 0.8 }} whileHover={!inSheet ? { scale: 1.12 } : {}}
        title="Customize" style={{ position: "relative", overflow: "visible" }}
      >
        {/* <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
          <motion.span
            animate={{ backgroundColor: burstColor, boxShadow: `0 0 0 2px ${burstColor}55` }}
            transition={{ duration: 0.35 }}
            style={{ width: "11px", height: "11px", borderRadius: "50%", display: "inline-block", flexShrink: 0 }}
          />
          {inSheet && <span>Customize</span>}
        </span> */}
        <PiPaletteFill />
      </motion.button>
    </>
  );

  // ── Customize Modal ────────────────────────────────────────────────────
  const CustomizeModal = () => createPortal(
    <AnimatePresence>
      {showCustomize && (
        <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeCustomize(); }}
          style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <motion.div key="modal" initial={{ opacity: 0, scale: 0.72, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.72, y: 40 }}
            transition={{ type: "spring", stiffness: 440, damping: 28, mass: 0.75 }}
            style={{ background: modalBg, borderRadius: "26px", padding: "1.75rem", width: "100%",
              maxWidth: "400px", margin: "0 1.25rem",
              boxShadow: "0 40px 100px rgba(0,0,0,0.3),0 8px 24px rgba(0,0,0,0.15)",
              border: `1px solid ${modalBorder}`, maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.2 }}
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}
            >
              <div>
                <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.05rem", fontWeight: 700, color: modalText }}>Customize</h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: modalSubtext }}>Personalize your experience</p>
              </div>
              <motion.button onClick={closeCustomize} whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.18 }}
                style={{ background: btnBg, border: "none", borderRadius: "50%", width: "30px", height: "30px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: modalSubtext, fontSize: "0.8rem", flexShrink: 0, marginLeft: "0.5rem" }}
              ><AiOutlineClose /></motion.button>
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              style={{ display: "flex", gap: "0.3rem", background: tabBg, borderRadius: "12px", padding: "0.3rem", marginBottom: "1.25rem" }}
            >
              {[{ id: "colors", label: "🎨  Colors" }, { id: "layout", label: "⠿  Layout" }].map((tab) => (
                <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)} whileTap={{ scale: 0.96 }}
                  style={{ flex: 1, padding: "0.55rem 0.5rem", borderRadius: "9px", border: "none",
                    background: activeTab === tab.id ? tabActiveBg : "transparent",
                    color: activeTab === tab.id ? modalText : modalSubtext,
                    fontSize: "0.82rem", fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: "pointer", fontFamily: "var(--font-base)",
                    boxShadow: activeTab === tab.id ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.18s ease" }}
                >{tab.label}</motion.button>
              ))}
            </motion.div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === "colors" ? (
                <motion.div key="colors" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.65rem" }}>
                    {accentList.map((a, i) => {
                      const hex = getAccentColor(a), isSelected = pendingAccent === a;
                      return (
                        <motion.button key={a}
                          initial={{ opacity: 0, scale: 0.75, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.05 + i * 0.05 }}
                          whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.94 }}
                          onClick={() => setPendingAccent(a)}
                          style={{ background: isSelected ? `${hex}1a` : cardBg, border: `2px solid ${isSelected ? hex : cardBorder}`,
                            borderRadius: "14px", padding: "0.9rem 0.85rem", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "0.7rem",
                            position: "relative", overflow: "hidden", transition: "border 0.15s ease,background 0.15s ease" }}
                        >
                          <motion.div animate={isSelected ? { scale: [1, 1.2, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}
                            style={{ width: "34px", height: "34px", borderRadius: "50%", background: hex, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${hex}44` }}
                          >
                            <AnimatePresence>
                              {isSelected && (
                                <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                  transition={{ type: "spring", stiffness: 520, damping: 20 }}
                                  style={{ color: "#fff", fontSize: "0.7rem", display: "flex" }}>
                                  <BsCheckLg />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          <span style={{ fontSize: "0.85rem", fontWeight: isSelected ? 600 : 500, color: isSelected ? hex : labelColor,
                            textTransform: "capitalize", transition: "color 0.15s ease", fontFamily: "var(--font-base)" }}>
                            {a}
                          </span>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{ position: "absolute", inset: 0, borderRadius: "14px", pointerEvents: "none",
                                  background: `radial-gradient(ellipse at 20% 50%,${hex}18,transparent 65%)` }}
                              />
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="layout" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}
                >
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.8px",
                    textTransform: "uppercase", color: modalSubtext, marginBottom: "0.6rem" }}>
                    Quick presets
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                    {Object.entries(CARD_PRESETS).map(([key, preset]) => {
                      const isActive = JSON.stringify(pendingOrder) === JSON.stringify(preset.order);
                      return (
                        <motion.button key={key} whileTap={{ scale: 0.96 }}
                          onClick={() => setPendingOrder([...preset.order])}
                          style={{ flex: 1, padding: "0.6rem 0.5rem", borderRadius: "10px",
                            background: isActive ? `${burstColor}18` : cardBg,
                            color: isActive ? burstColor : labelColor, fontSize: "0.8rem",
                            fontWeight: isActive ? 600 : 500, cursor: "pointer",
                            fontFamily: "var(--font-base)",
                            border: `1.5px solid ${isActive ? burstColor : cardBorder}`,
                            transition: "all 0.15s ease" }}
                        >{preset.label}</motion.button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div style={{ flex: 1, height: "1px", background: modalBorder }} />
                    <span style={{ fontSize: "0.7rem", color: modalSubtext, whiteSpace: "nowrap" }}>or drag to fine-tune</span>
                    <div style={{ flex: 1, height: "1px", background: modalBorder }} />
                  </div>

                  {pendingOrder && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                      {pendingOrder.map((section, i) => (
                        <motion.div key={section} draggable
                          onDragStart={() => handleModalDragStart(i)}
                          onDragEnter={() => handleModalDragEnter(i)}
                          onDragEnd={handleModalDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.15 }}
                          style={{ background: dragRowBg, border: `1.5px solid ${dragRowBorder}`,
                            borderRadius: "10px", cursor: "grab", userSelect: "none",
                            display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.6rem 0.85rem" }}
                        >
                          <span style={{ width: "18px", height: "18px", borderRadius: "50%",
                            background: `${burstColor}20`, color: burstColor,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.62rem", fontWeight: 700, flexShrink: 0 }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: labelColor, flex: 1 }}>
                            {CARD_SECTION_LABELS[section]}
                          </span>
                          <span style={{ color: modalSubtext, opacity: 0.4, fontSize: "0.9rem" }}>⠿</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setPendingOrder([...CARD_DEFAULT_ORDER])}
                    style={{ marginTop: "0.75rem", display: "block", width: "100%", padding: "0.5rem",
                      borderRadius: "8px", border: `1px dashed ${cardBorder}`, background: "transparent",
                      color: modalSubtext, fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--font-base)" }}
                  >↺ Reset to default</button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              style={{ display: "flex", gap: "0.65rem", marginTop: "1.25rem" }}
            >
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={closeCustomize}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "12px", border: `1px solid ${btnBorder}`,
                  background: "transparent", color: modalSubtext, fontSize: "0.85rem", fontWeight: 500,
                  cursor: "pointer", fontFamily: "var(--font-base)" }}
              >Cancel</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveAll}
                style={{ flex: 1, padding: "0.7rem", borderRadius: "12px", border: "none",
                  background: getAccentColor(pendingAccent), color: "#fff", fontSize: "0.85rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--font-base)",
                  boxShadow: `0 4px 18px ${getAccentColor(pendingAccent)}55`,
                  transition: "background 0.2s ease,box-shadow 0.2s ease" }}
              >Apply</motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );

  // ── Bottom Sheet ───────────────────────────────────────────────────────
  const BottomSheet = () => createPortal(
    <AnimatePresence>
      {isMobile && isNavShowing && (
        <>
          <motion.div key="overlay" className="nav__overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} onClick={closeNav}
          />
          <motion.div key="sheet" className="nav__sheet"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="nav__sheet-handle" />
            <ul className="nav__sheet-menu">
              {sheetLinks.map(({ name, label, path }, i) => (
                <motion.li key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22 }}
                >
                  <Link to={path}
                    className={`nav__sheet-link${name === "Logout" ? " nav__sheet-link--danger" : ""}`}
                    onClick={() => { closeNav(); scrollTop(); }}
                  >{label || name}</Link>
                </motion.li>
              ))}
            </ul>
            <div className="nav__sheet-theme">
              <p className="nav__sheet-theme-label">Appearance</p>
              <div className="nav__sheet-theme-row"><ThemeButtons inSheet={true} /></div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <>
      <nav>
        <div className="nav__container">
          <div className="nav__pill">
            <Link to="/" className="nav__logo" onClick={scrollTop}>
              <img src={Logo} alt="Mern Blog" />
            </Link>
            {!isMobile && (
              <ul className="nav__menu">
                {desktopLinks.map(({ name, path }, i) => (
                  <li key={i}><Link to={path} onClick={scrollTop} className="nav__link">{name}</Link></li>
                ))}
              </ul>
            )}
            <div className="nav__right">
              <div className="nav__theme-controls"><ThemeButtons inSheet={false} /></div>
              {isMobile && (
                <motion.button className="nav__toggle-btn"
                  onClick={() => setIsNavShowing((prev) => !prev)} whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {isNavShowing ? (
                      <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: "flex" }}>
                        <AiOutlineClose />
                      </motion.span>
                    ) : (
                      <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} style={{ display: "flex" }}>
                        <FaBars />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <BottomSheet />
      <CustomizeModal />
      <AnimatePresence>
        {isMobile && currentUser && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
            style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 97 }}
          >
            <Link to="/create" className="nav__fab" onClick={scrollTop} title="Create Post">+</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;