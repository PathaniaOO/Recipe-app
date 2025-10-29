// src/pages/Surprise.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomMeal } from "../api/meals";

export default function Surprise() {
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);

  useEffect(() => {
    (async () => {
      const m = await getRandomMeal();
      setMeal(m);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm bg-gray-200 px-3 py-1 rounded">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-3">🎲 Surprise Me</h2>

      {meal ? (
        <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-2">{meal.strMeal}</h3>
          <img src={meal.strMealThumb} className="w-full h-48 object-cover rounded mb-3" alt={meal.strMeal}/>
          <p className="text-sm text-gray-700 whitespace-pre-line">{meal.strInstructions}</p>
        </div>
      ) : (
        <div className="text-gray-500">Loading…</div>
      )}
    </div>
  );
}
