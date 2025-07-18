
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ChatAssistant from "./pages/ChatAssistant";
import CulturalTranslator from "./pages/CulturalTranslator";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MapExplorer from "./pages/MapExplorer";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Index />} />
          
          {/* Wrap main routes with PrivateRoute */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <ChatAssistant />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <PrivateRoute>
                <MapExplorer />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/translator" 
            element={
              <PrivateRoute>
                <CulturalTranslator />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
