import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import CreateAccountPage from './pages/CreateAccountPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import AddFoodPage from './pages/AddFoodPage.tsx'
import MyFoodsPage from './pages/MyFoodsPage.tsx'
import EditFoodPage from './pages/EditFoodPage.tsx'
import PlanMealPage from './pages/PlanMealPage.tsx'
import EditMealPage from './pages/EditMealPage.tsx'
import CalendarPage from './pages/CalendarPage.tsx'
import AddRecipePage from './pages/AddRecipePage.tsx'
import MyRecipesPage from './pages/MyRecipesPage.tsx'
import ViewRecipePage from './pages/ViewRecipePage.tsx'
import EditRecipePage from './pages/EditRecipePage.tsx'
import RequireAuth from './components/RequireAuth.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/add-food"
        element={
          <RequireAuth>
            <AddFoodPage />
          </RequireAuth>
        }
      />
      <Route
        path="/foods"
        element={
          <RequireAuth>
            <MyFoodsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/foods/:foodId/edit"
        element={
          <RequireAuth>
            <EditFoodPage />
          </RequireAuth>
        }
      />
      <Route
        path="/plan-meal"
        element={
          <RequireAuth>
            <PlanMealPage />
          </RequireAuth>
        }
      />
      <Route
        path="/calendar"
        element={
          <RequireAuth>
            <CalendarPage />
          </RequireAuth>
        }
      />
      <Route
        path="/meals/:mealId/edit"
        element={
          <RequireAuth>
            <EditMealPage />
          </RequireAuth>
        }
      />
      <Route
        path="/add-recipe"
        element={
          <RequireAuth>
            <AddRecipePage />
          </RequireAuth>
        }
      />
      <Route
        path="/recipes"
        element={
          <RequireAuth>
            <MyRecipesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/recipes/:recipeId"
        element={
          <RequireAuth>
            <ViewRecipePage />
          </RequireAuth>
        }
      />
      <Route
        path="/recipes/:recipeId/edit"
        element={
          <RequireAuth>
            <EditRecipePage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App
