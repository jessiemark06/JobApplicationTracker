import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/layout";
import Companies from "./pages/companies";
import Login from "./pages/login";


function App() {
    return (
        <BrowserRouter>
            <Routes>

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

            </Routes>
        </BrowserRouter>
    );
}

export default App;