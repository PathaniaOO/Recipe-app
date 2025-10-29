import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import QuickRecipes from "./pages/QuickRecipes";
import Surprise from "./pages/Surprise";
import RecipeDetail from "./pages/RecipeDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipe/:id" element={<RecipeDetail />} />
      <Route path="/quick" element={<QuickRecipes />} />
      <Route path="/surprise" element={<Surprise />} />
    </Routes>
  );
}
