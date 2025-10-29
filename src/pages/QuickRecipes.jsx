// src/pages/QuickRecipes.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomMeal, getMealDetails } from "../api/meals";

export default function QuickRecipes() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      setLoading(true);
      const list = [];
      for (let i = 0; i < 5; i++) {
        try {
          const meal = await getRandomMeal();
          list.push(meal);
        } catch (err) {
          console.error(err);
        }
      }
      setMeals(list);
      setLoading(false);
    })();
  }, []);

  async function openDetails(id) {
    const d = await getMealDetails(id);
    setSelected(d);
  }

  // lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm bg-gray-200 px-3 py-1 rounded">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">⏱️ 15-Minute Recipes (Random Picks)</h2>

      {loading ? (
        <div className="text-gray-500 text-center">Loading recipes...</div>
      ) : (
        <div className="grid gap-3">
          {meals.map((m) => (
            <div key={m.idMeal} className="flex justify-between bg-white p-3 rounded shadow">
              <div className="flex items-center gap-3">
                <img src={m.strMealThumb} className="w-14 h-14 rounded" alt={m.strMeal}/>
                <p>{m.strMeal}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openDetails(m.idMeal)} className="bg-orange-500 text-white px-3 py-1 rounded">
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          {/* Modal box: max-h keeps it inside viewport; overflow-y-auto gives internal scrolling */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
            {/* Close button fixed inside modal (stays visible while content scrolls) */}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md z-10"
            >
              ✕ Close
            </button>

            <div className="p-6 pt-12"> {/* extra top padding so content isn't under the close button */}
              <h3 className="text-xl font-bold mb-3">{selected.strMeal}</h3>
              <img src={selected.strMealThumb} alt="" className="w-full h-44 object-cover rounded mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Ingredients</h4>
                  <ul className="list-disc list-inside text-sm max-h-[60vh] overflow-y-auto pr-2">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const n = i + 1;
                      const ing = selected[`strIngredient${n}`];
                      const measure = selected[`strMeasure${n}`];
                      if (!ing || !ing.trim()) return null;
                      return (
                        <li key={n}>
                          {measure ? `${measure} ` : ""}{ing}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Instructions</h4>
                  <div className="text-sm whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
                    {selected.strInstructions}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selected.strYoutube && (
                  <a href={selected.strYoutube} target="_blank" rel="noreferrer" className="px-4 py-2 border rounded-lg text-sm">
                    ▶ Watch on YouTube
                  </a>
                )}
                {selected.strSource && (
                  <a href={selected.strSource} target="_blank" rel="noreferrer" className="px-4 py-2 border rounded-lg text-sm">
                    🔗 Source
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
