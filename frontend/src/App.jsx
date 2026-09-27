import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/dashboard";
import Companies from "./pages/companies";
import Applications from "./pages/applications";
import AddApplication from "./pages/AddApplication";
import ApplicationDetails from "./pages/ApplicationDetails";
import Login from "./pages/login";
import Landing from "./pages/landing";
import AddCompany from "./pages/AddCompany";
import CompanyDetails from "./pages/CompanyDetails";
import Register from "./pages/Register";
import AdminUsers from "./pages/AdminUsers";
import { useAuth } from "./context/AuthContext";

function AdminRoute({ children }) {
    const { user } = useAuth();

    if (user?.email?.toLowerCase() !== "jessiemarkbaronda06@gmail.com") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Landing />}
                />


                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route path="/register" element={<Register />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminRoute>
                                <Layout>
                                    <AdminUsers />
                                </Layout>
                            </AdminRoute>
                        </ProtectedRoute>
                    }
                />

              <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                                
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/companies"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Companies />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applications"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Applications />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applications/create"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AddApplication />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applications/edit/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AddApplication />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/applications/view/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <ApplicationDetails />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/companies/create"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AddCompany />
                                
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/companies/edit/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AddCompany />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/companies/view/:id"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <CompanyDetails />
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
            
        </BrowserRouter>
    );
}

export default App;