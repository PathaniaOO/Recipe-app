// src/pages/Home.jsx
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomMeal } from "../api/meals"; // centralized api file you already planned

export default function Home() {
  const navigate = useNavigate();
  const [showRecipes, setShowRecipes] = useState(false);
  const [featured, setFeatured] = useState(null);
  const [loadingFeatured, setLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState(null);

  // search input
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // recent searches kept in localStorage
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });

  // friendly name from localStorage (you can set it on login / settings)
  const name = localStorage.getItem("userName") || "Taylor";

  useEffect(() => {    const timer = setTimeout(() => setShowRecipes(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // fetch featured random recipe on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingFeatured(true);
      setFeaturedError(null);
      try {
        const meal = await getRandomMeal();
        if (!mounted) return;
        setFeatured(meal);
      } catch (err) {
        if (!mounted) return;
        setFeaturedError("Could not load featured recipe.");
        console.error(err);
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // navigate to recipes with query param
  function submitSearch(q = query) {
    if (!q || !q.trim()) return;
    const clean = q.trim();
    // update recent search list
    const next = [clean, ...recent.filter(r => r.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecent(next);
    localStorage.setItem("recentSearches", JSON.stringify(next));
    // navigate to recipes page — implementation expects you handle ?ingredient= in Recipes.jsx
    navigate(`/recipes?ingredient=${encodeURIComponent(clean)}`);
  }

  // quick open featured details
  function openFeatured() {
    if (!featured) return;
    // Decide your detail route: if your detail page is /recipe/:id (or /recipes/:id). Update accordingly.
    navigate(`/recipe/${featured.idMeal}`); // change to /recipes/${featured.idMeal} if your routes differ
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-amber-200 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 60 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl text-center grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left: Intro + controls */}
        <div className="flex flex-col items-start justify-center gap-4 p-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-800"
          >
            👋 Hey, {name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-600"
          >
            Find something great to cook today — search by ingredient or let me surprise you.
          </motion.p>

          <div className="w-full mt-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                placeholder="Search by ingredient (eg. chicken, tomato)..."
                className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                onClick={() => submitSearch()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 rounded-xl transition"
                aria-label="Search"
              >
                🔎
              </button>
            </div>

            {/* Quick action buttons (appear after animation) */}
            {showRecipes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.6 }}
                className="mt-4 flex flex-wrap gap-3"
              >
                <button
                  onClick={() => navigate("/recipes")}
                  className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-2 px-4 rounded-xl transition"
                >
                  🍳 Browse All
                </button>

                <button
                  onClick={() => navigate("/quick")}
                  className="bg-amber-300 hover:bg-amber-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition"
                >
                  ⏱️ 15-Minute Recipes
                </button>

                <button
                  onClick={() => navigate("/surprise")}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-xl transition"
                >
                  🧑‍🍳 Surprise Me
                </button>
              </motion.div>
            )}

            {/* recent searches chips */}
            {recent.length > 0 && (
              <div className="mt-4 text-left">
                <div className="text-sm text-gray-500 mb-2">Recent searches</div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setQuery(r);
                        submitSearch(r);
                      }}
                      className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm"
                    >
                      {r}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setRecent([]);
                      localStorage.removeItem("recentSearches");
                    }}
                    className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Featured recipe card */}
        <div className="p-2 flex items-center justify-center">
          <div className="w-full max-w-md">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border"
            >
              {loadingFeatured ? (
                // simple loading skeleton
                <div className="p-6">
                  <div className="h-40 bg-gray-100 rounded-md animate-pulse" />
                  <div className="mt-4 h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="mt-2 h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              ) : featuredError ? (
                <div className="p-6 text-red-600">{featuredError}</div>
              ) : featured ? (
                <div>
                  <img
                    src={featured.strMealThumb}
                    alt={featured.strMeal}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-4 text-left">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{featured.strMeal}</h3>
                      <span className="text-sm text-gray-500">{featured.strArea}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {featured.strInstructions?.slice(0, 140)}{featured.strInstructions?.length > 140 ? "..." : ""}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={openFeatured}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl transition"
                      >
                        View Recipe
                      </button>
                      <button
                        onClick={async () => {
                          // reload featured
                          setFeatured(null);
                          setLoadingFeatured(true);
                          setFeaturedError(null);
                          try {
                            const m = await getRandomMeal();
                            setFeatured(m);
                          } catch (err) {
                            console.error(err);
                            setFeaturedError("Could not refresh.");
                          } finally {
                            setLoadingFeatured(false);
                          }
                        }}
                        className="px-4 py-2 rounded-xl border"
                        title="Another random recipe"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-gray-600">No featured recipe available.</div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
