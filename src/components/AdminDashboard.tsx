
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Eye, Filter, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectSubmission {
  id: string;
  project_name: string;
  class: string;
  group_class: string;
  course: string;
  lecturer: string;
  grade: string;
  program_study: string;
  document_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [prodiFilter, setProdiFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, statusFilter, prodiFilter, searchTerm]);

  const fetchSubmissions = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('projects_submissions')
      .select(`
        *,
        profiles (
          full_name,
          username
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
      setSubmissions([]);
    } else {
      // Filter out any submissions without valid profile data
      const validSubmissions = (data || [])
        .filter((submission): submission is ProjectSubmission => {
          return submission.profiles !== null && 
                 typeof submission.profiles === 'object' && 
                 'full_name' in submission.profiles &&
                 'username' in submission.profiles &&
                 typeof submission.profiles.full_name === 'string' &&
                 typeof submission.profiles.username === 'string';
        });
      
      setSubmissions(validSubmissions);
    }
    setLoading(false);
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (prodiFilter !== "all") {
      filtered = filtered.filter(sub => sub.program_study === prodiFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.lecturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleReview = (submission: ProjectSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || "");
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    const { error } = await supabase
      .from('projects_submissions')
      .update({
        status: 'approved',
        admin_notes: adminNotes.trim() || null
      })
      .eq('id', selectedSubmission.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Project approved successfully!",
      });
      setShowReviewModal(false);
      fetchSubmissions();
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    const { error } = await supabase
      .from('projects_submissions')
      .update({
        status: 'rejected',
        admin_notes: adminNotes.trim() || null
      })
      .eq('id', selectedSubmission.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Project rejected",
      });
      setShowReviewModal(false);
      fetchSubmissions();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>;
    }
  };

  const getStats = () => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900">Admin Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-slate-600">Total Submissions</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-slate-600">Pending Review</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-slate-600">Approved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-slate-600">Rejected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search projects, courses, lecturers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prodiFilter} onValueChange={setProdiFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Program Study" />
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
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading submissions...</p>
            </CardContent>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-600">No submissions found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{submission.project_name}</CardTitle>
                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                      <p><strong>Student:</strong> {submission.profiles.full_name} ({submission.profiles.username})</p>
                      <p><strong>Course:</strong> {submission.course}</p>
                      <p><strong>Class:</strong> {submission.class} - {submission.group_class}</p>
                      <p><strong>Lecturer:</strong> {submission.lecturer}</p>
                      <p><strong>Program:</strong> {submission.program_study}</p>
                      <p><strong>Submitted:</strong> {new Date(submission.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(submission.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {submission.document_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(submission.document_url!, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Document
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleReview(submission)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
                {submission.admin_notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm"><strong>Admin Notes:</strong></p>
                    <p className="text-sm text-slate-700 mt-1">{submission.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Project Submission</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Project:</strong> {selectedSubmission.project_name}</p>
                  <p><strong>Student:</strong> {selectedSubmission.profiles.full_name}</p>
                  <p><strong>Course:</strong> {selectedSubmission.course}</p>
                  <p><strong>Class:</strong> {selectedSubmission.class}</p>
                </div>
                <div>
                  <p><strong>Lecturer:</strong> {selectedSubmission.lecturer}</p>
                  <p><strong>Program:</strong> {selectedSubmission.program_study}</p>
                  <p><strong>Grade:</strong> {selectedSubmission.grade || 'Not provided'}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedSubmission.status)}</p>
                </div>
              </div>

              {selectedSubmission.document_url && (
                <div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedSubmission.document_url!, '_blank')}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Project Document
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the student..."
                  rows={4}
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={selectedSubmission.status === 'approved'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                  disabled={selectedSubmission.status === 'rejected'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
