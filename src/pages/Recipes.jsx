import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRecipesByIngredient, getAllMeals } from "../api/meals";

const PAGE_SIZE = 12;

export default function Recipes() {
  const location = useLocation();
  const navigate = useNavigate();

  const ingredient = new URLSearchParams(location.search).get("ingredient") || "";
  const [meals, setMeals] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setMeals([]);
      setVisibleCount(PAGE_SIZE);
      try {
        if (ingredient) {
          const data = await getRecipesByIngredient(ingredient);
          if (cancelled) return;
          setMeals(data || []);
        } else {
          const data = await getAllMeals(); // uses cache internally
          if (cancelled) return;
          setMeals(data || []);
        }
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError("Failed to load recipes. Try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ingredient]);

  function loadMore() {
    setVisibleCount((v) => v + PAGE_SIZE);
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {ingredient ? `Results for "${ingredient}"` : "Browse All Recipes"}
          </h1>
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-sm px-3 py-2 border rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 animate-pulse h-56" />
            ))}
          </div>
        )}

        {error && <div className="text-red-600 mb-4">{error}</div>}

        {!loading && !error && meals.length === 0 && (
          <div className="text-gray-600">No recipes found.</div>
        )}

        {!loading && meals.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {meals.slice(0, visibleCount).map((meal) => (
                <div
                  key={meal.idMeal}
                  className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden transition cursor-pointer"
                  onClick={() => navigate(`/recipe/${meal.idMeal}`)}
                >
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h2 className="text-lg font-semibold">{meal.strMeal}</h2>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recipe/${meal.idMeal}`);
                        }}
                        className="text-sm text-orange-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const favs = JSON.parse(localStorage.getItem("favs") || "[]");
                          if (!favs.find((f) => f.idMeal === meal.idMeal)) {
                            localStorage.setItem("favs", JSON.stringify([meal, ...favs]));
                          }
                        }}
                        className="text-sm text-gray-500"
                        title="Save to favorites"
                      >
                        ☆
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < meals.length && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  Load more ({meals.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
