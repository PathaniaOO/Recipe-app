// src/pages/RecipeDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getMealDetails } from "../api/meals";

function extractIngredients(meal) {
  if (!meal) return [];
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ ingredient: ing.trim(), measure: measure ? measure.trim() : "" });
    }
  }
  return ingredients;
}

export default function RecipeDetail() {
  const { id } = useParams(); // expects route /recipe/:id
  const navigate = useNavigate();
  const location = useLocation();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let canceled = false;
    async function load() {
      if (!id) {
        setError("No recipe id provided.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Optional optimization: if the route was navigated with state containing a full meal,
        // you could use that first (but still fetch full details to be safe).
        // const maybeFromState = location.state;
        // if (maybeFromState && maybeFromState.idMeal === id && maybeFromState.strInstructions) {
        //   setMeal(maybeFromState); setLoading(false); return;
        // }

        const data = await getMealDetails(id);
        if (canceled) return;
        if (!data) {
          setError("Recipe not found.");
          setMeal(null);
        } else {
          setMeal(data);
        }
      } catch (err) {
        console.error(err);
        if (!canceled) setError("Failed to load recipe.");
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="animate-pulse w-full max-w-3xl">
          <div className="h-64 bg-gray-100 rounded-lg" />
          <div className="h-6 bg-gray-100 rounded mt-4" />
          <div className="h-4 bg-gray-100 rounded mt-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 text-sm px-3 py-2 border rounded-lg">
            ← Back
          </button>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 text-sm px-3 py-2 border rounded-lg">
            ← Back
          </button>
          <div>No recipe found.</div>
        </div>
      </div>
    );
  }

  const ingredients = extractIngredients(meal);

  return (
    <div className="min-h-screen bg-orange-50 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex items-start gap-6 flex-col md:flex-row">
          <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full md:w-1/3 h-56 object-cover rounded-lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{meal.strMeal}</h1>
                <div className="text-sm text-gray-500 mt-1">{meal.strArea} • {meal.strCategory}</div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => {
                    const favs = JSON.parse(localStorage.getItem("favs") || "[]");
                    if (!favs.find(f => f.idMeal === meal.idMeal)) {
                      localStorage.setItem("favs", JSON.stringify([meal, ...favs]));
                    }
                  }}
                  className="px-3 py-1 border rounded-lg"
                >
                  ☆ Save
                </button>
              </div>
            </div>

            <section className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <ul className="list-disc list-inside text-sm">
                  {ingredients.map((it, i) => (
                    <li key={i}>
                      {it.measure ? `${it.measure} ` : ""}{it.ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-sm whitespace-pre-line">{meal.strInstructions}</p>
              </div>
            </section>

            <div className="mt-6 flex gap-3">
              {meal.strYoutube && (
                <a
                  href={meal.strYoutube}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  ▶ Watch on YouTube
                </a>
              )}
              {meal.strSource && (
                <a
                  href={meal.strSource}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  🔗 Source
                </a>
              )}
              <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg text-sm">
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
