
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Users, BookOpen, User, GraduationCap } from "lucide-react";

interface Project {
  id: string;
  projectName: string;
  groupName: string;
  members: string[];
  courseName: string;
  lecturer: string;
  className: string;
  prodi: string;
  angkatan: string;
  status: "approved" | "pending" | "rejected";
}

interface ProjectsTableProps {
  searchTerm: string;
}

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: "1",
    projectName: "Smart Campus Management System",
    groupName: "Tech Innovators",
    members: ["Ahmad Fauzi", "Sari Indah", "Budi Santoso"],
    courseName: "Rekayasa Perangkat Lunak",
    lecturer: "Dr. Ir. Bambang Suharto, M.T.",
    className: "TI-3A",
    prodi: "Teknik Informatika",
    angkatan: "2022",
    status: "approved"
  },
  {
    id: "2",
    projectName: "IoT-Based Environmental Monitoring",
    groupName: "Green Tech",
    members: ["Maya Putri", "Eko Prasetyo", "Rina Sari", "Dani Kurniawan"],
    courseName: "Internet of Things",
    lecturer: "Prof. Dr. Siti Nurhaliza, M.Kom.",
    className: "TI-3B",
    prodi: "Teknik Informatika",
    angkatan: "2022",
    status: "approved"
  },
  {
    id: "3",
    projectName: "E-Commerce Mobile App with AI Recommendation",
    groupName: "Mobile Masters",
    members: ["Rizki Ananda", "Putri Maharani"],
    courseName: "Pemrograman Mobile",
    lecturer: "Ir. Andi Wijaya, M.T.",
    className: "SI-3A",
    prodi: "Sistem Informasi",
    angkatan: "2022",
    status: "pending"
  },
  {
    id: "4",
    projectName: "Blockchain-Based Certificate Verification",
    groupName: "Crypto Coders",
    members: ["Fajar Ramadhan", "Lisa Permata", "Andi Saputra"],
    courseName: "Keamanan Siber",
    lecturer: "Dr. Muhammad Yusuf, M.Kom.",
    className: "TK-3A",
    prodi: "Teknik Komputer",
    angkatan: "2022",
    status: "approved"
  },
  {
    id: "5",
    projectName: "AR-Based Learning Platform for Chemistry",
    groupName: "AR Innovators",
    members: ["Dewi Kartika", "Arif Hidayat", "Nisa Rahma"],
    courseName: "Multimedia Interaktif",
    lecturer: "Ir. Ratna Sari, M.T.",
    className: "MI-3B",
    prodi: "Multimedia dan Jaringan",
    angkatan: "2022",
    status: "approved"
  }
];

const ProjectsTable = ({ searchTerm }: ProjectsTableProps) => {
  const [sortField, setSortField] = useState<keyof Project>("projectName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterProdi, setFilterProdi] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = mockProjects.filter(project => {
      const matchesSearch = searchTerm === "" || 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.members.some(member => member.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProdi = filterProdi === "all" || project.prodi === filterProdi;

      return matchesSearch && matchesProdi;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      }
      
      return 0;
    });
  }, [searchTerm, filterProdi, sortField, sortDirection]);

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleRowExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    }
  };

  const SortButton = ({ field, children }: { field: keyof Project; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 font-semibold text-blue-900 hover:bg-blue-50"
    >
      {children}
      {sortField === field && (
        sortDirection === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <label htmlFor="prodi-filter" className="text-sm font-medium text-slate-700">Filter by Program:</label>
          <Select value={filterProdi} onValueChange={setFilterProdi}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              <SelectItem value="Teknik Informatika">Teknik Informatika</SelectItem>
              <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
              <SelectItem value="Teknik Komputer">Teknik Komputer</SelectItem>
              <SelectItem value="Multimedia dan Jaringan">Multimedia dan Jaringan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-slate-600">
          Showing {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {filteredAndSortedProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500 text-lg">No projects found matching your criteria.</p>
          </Card>
        ) : (
          filteredAndSortedProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-blue-900 mb-2">{project.projectName}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {project.groupName}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {project.courseName}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {project.lecturer}
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {project.prodi} - {project.angkatan}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(project.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpansion(project.id)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      {expandedRows.has(project.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedRows.has(project.id) && (
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Group Members</h4>
                      <div className="space-y-2">
                        {project.members.map((member, index) => (
                          <div key={index} className="flex items-center p-2 bg-slate-50 rounded-lg">
                            <User className="w-4 h-4 text-slate-500 mr-2" />
                            <span className="text-slate-700">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3">Project Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Class:</span>
                          <span className="font-medium text-slate-800">{project.className}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Program:</span>
                          <span className="font-medium text-slate-800">{project.prodi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Batch:</span>
                          <span className="font-medium text-slate-800">{project.angkatan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsTable;
