import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/layout";
import Companies from "./pages/companies";
import Login from "./pages/login";
import Landing from "./pages/landing";
import AddCompany from "./pages/AddCompany";

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
                    path="/companies/create"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <AddCompany />
                                
                            </Layout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
            
        </BrowserRouter>
    );
}

export default App;