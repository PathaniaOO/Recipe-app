// src/api/meals.js
const BASE_URL = "https://www.themealdb.com/api/json/v1/1"; // public API for meals

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export async function getRecipesByIngredient(ingredient) {
  const res = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = await res.json();
  return data.meals || [];
}

export async function getMealDetails(idMeal) {
  const res = await fetch(`${BASE_URL}/lookup.php?i=${idMeal}`);
  const data = await res.json();
  return data.meals ? data.meals[0] : null;
}

export async function getRandomMeal() {
  const res = await fetch(`${BASE_URL}/random.php`);
  const data = await res.json();
  return data.meals ? data.meals[0] : null;
}

/**
 * getAllMeals()
 * - Fetches categories, then meals per category (parallel)
 * - Dedupes by idMeal
 * - Caches result in localStorage with TTL (default 6 hours)
 */
export async function getAllMeals({ ttlHours = 6 } = {}) {
  const cacheKey = "themealdb_all_meals"; // clearer cache key

  // 0) try read cache
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (cached && Date.now() - cached.ts < ttlHours * 60 * 60 * 1000) {
      return cached.data;
    }
  } catch (e) {
    // log parse/read errors but fall through to fetch
    console.error("Failed to read cache", e);
  }

  // 1) get categories
  const catData = await fetchJson(`${BASE_URL}/list.php?c=list`);
  const categories = (catData.meals || []).map((c) => c.strCategory);

  // 2) fetch meals for each category in parallel
  const promises = categories.map((c) =>
    fetchJson(`${BASE_URL}/filter.php?c=${encodeURIComponent(c)}`).then((d) => d.meals || [])
  );

  const results = await Promise.all(promises); // array of arrays
  const combined = results.flat();

  // 3) dedupe by idMeal and return basic meal objects
  const map = new Map();
  for (const meal of combined) {
    if (!map.has(meal.idMeal)) map.set(meal.idMeal, meal);
  }
  const final = Array.from(map.values());

  // 4) cache
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: final }));
  } catch (e) {
    // ignore storage quota errors but log for debugging
    console.warn("Failed to write cache", e);
  }

  return final;
}
