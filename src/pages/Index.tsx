
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, MapPin, Clock, Users, BookOpen, GraduationCap } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import ProjectsTable from "@/components/ProjectsTable";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-sky-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-blue-900">Expo Polnes</h1>
          </div>
          <Button 
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Login / Register
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-blue-900 mb-4 animate-fade-in">
              TI EXPO 2025
            </h1>
            <h2 className="text-2xl font-semibold text-sky-600 mb-6">
              Showcase Your Innovation!
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              An annual exhibition where students from all study programs in the Department of Information Technology 
              showcase their best projects. Let's celebrate creativity, collaboration, and applied technology.
            </p>
          </div>

          {/* Event Details Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Event Date</h3>
                <p className="text-slate-600">March 15-17, 2025</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Venue</h3>
                <p className="text-slate-600">Politeknik Negeri Samarinda</p>
                <p className="text-slate-500 text-sm">Main Hall & IT Building</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 mb-2">Registration Deadline</h3>
                <p className="text-slate-600">February 28, 2025</p>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="lg" 
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Register Your Project
          </Button>
        </div>
      </section>

      {/* Live Projects Table Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Registered Projects</h2>
            <p className="text-slate-600 text-lg">See all the amazing projects that will be showcased at TI EXPO 2025</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search projects, groups, or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <ProjectsTable searchTerm={searchTerm} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-300 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-900" />
            </div>
            <h3 className="text-xl font-bold">Expo Polnes</h3>
          </div>
          <p className="text-blue-200 mb-2">Department of Information Technology</p>
          <p className="text-blue-300">Politeknik Negeri Samarinda</p>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Index;
