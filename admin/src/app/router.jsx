import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import OffersListPage from "../pages/OffersListPage";
import NotFoundPage from "../pages/NotFoundPage";
import OfferEditorPage from "../pages/OfferEditorPage";
import TagsPage from "../pages/TagsPage";
import BranchesPage from "../pages/BranchesPage";
import CitiesPage from "../pages/CitiesPage";
import LeadsPage from "../pages/LeadsPage";
import BlogListPage from "../pages/BlogListPage";
import BlogEditorPage from "../pages/BlogEditorPage";
import CategoriesPage from "../pages/CategoriesPage";





export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <OffersListPage /> },
      { path: "/admin/offers", element: <OffersListPage /> },
      { path: "/admin/offers/new", element: <OfferEditorPage /> },
      { path: "/admin/offers/:id/edit", element: <OfferEditorPage /> },
      { path: "/admin/tags", element: <TagsPage /> },
      { path: "/admin/branches", element: <BranchesPage /> },
      { path: "/admin/cities", element: <CitiesPage /> },
      { path: "/admin/leads", element: <LeadsPage /> },
      { path: "/admin/blog", element: <BlogListPage /> },
      { path: "/admin/blog/new", element: <BlogEditorPage /> },
      { path: "/admin/blog/:id/edit", element: <BlogEditorPage /> },
      { path: "/admin/categories", element: <CategoriesPage /> },

      // هنضيف باقي الصفحات هنا بعدين
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
