import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./Components/Home";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Allproblem from "./Components/Allproblem";
import AdminPanel from "./Components/Adminpanel";
import ProblemPage from "./Components/Problem";
import { restoreAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import MainLayout from "./Mainlayout";
import SimpleEditor from "./Components/SimlpeEditor";
import Admin from "./Components/Admin";
import AdminDelete from "./pages/AdminDelete";
import AdminVideoDelete from "./pages/AdminVideoDelete";
import VideoUpload from "./pages/VideoUpload";




function App() {
  const { isAuthenticated, initialized, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>

      {/* Public routes WITHOUT header */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />

      {/* Protected routes WITH header */}
      <Route element={<MainLayout />}>
        <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />} />
        <Route path="/admin/create-problem" element={isAuthenticated && user?.role==='admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/problems" element={isAuthenticated ? <Allproblem /> : <Navigate to="/" />} />
         <Route path="/editor" element={isAuthenticated ? <SimpleEditor /> : <Navigate to="/login" />} />
         <Route path="/problem/:problemId" element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" />}/>
         <Route path="/admin" element={isAuthenticated && user?.role==='admin' ? <Admin /> : <Navigate to="/" />} />
         <Route path="/admin/delete-problem" element={isAuthenticated && user?.role==='admin' ? <AdminDelete /> : <Navigate to="/" />}  />
         <Route path="/admin/video-problem" element={isAuthenticated && user?.role==='admin' ? <AdminVideoDelete /> : <Navigate to="/" />}  />
         <Route path="/video/upload/:problemId" element={isAuthenticated ? <VideoUpload /> : <Navigate to="/login" />} />
      </Route>

    </Routes>
  );
}

export default App;
