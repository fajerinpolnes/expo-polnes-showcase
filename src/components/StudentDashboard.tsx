
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [formData, setFormData] = useState({
    project_name: "",
    class: "",
    group_class: "",
    course: "",
    lecturer: "",
    grade: "",
    program_study: "",
    document: null as File | null
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('projects_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } else {
      setSubmissions(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      let documentUrl = null;
      
      // Upload document if provided
      if (formData.document) {
        setUploadingFile(true);
        const fileExt = formData.document.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(fileName, formData.document);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-documents')
          .getPublicUrl(fileName);
        
        documentUrl = publicUrl;
        setUploadingFile(false);
      }

      const submissionData = {
        user_id: user.id,
        project_name: formData.project_name,
        class: formData.class,
        group_class: formData.group_class,
        course: formData.course,
        lecturer: formData.lecturer,
        grade: formData.grade,
        program_study: formData.program_study,
        document_url: documentUrl,
      };

      let error;
      
      if (editingId) {
        const { error: updateError } = await supabase
          .from('projects_submissions')
          .update(submissionData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('projects_submissions')
          .insert([submissionData]);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: editingId ? "Project updated successfully!" : "Project submitted successfully!",
      });
      
      resetForm();
      fetchSubmissions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: "",
      class: "",
      group_class: "",
      course: "",
      lecturer: "",
      grade: "",
      program_study: "",
      document: null
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (submission: ProjectSubmission) => {
    setFormData({
      project_name: submission.project_name,
      class: submission.class,
      group_class: submission.group_class,
      course: submission.course,
      lecturer: submission.lecturer,
      grade: submission.grade,
      program_study: submission.program_study,
      document: null
    });
    setEditingId(submission.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('projects_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900">My Project Submissions</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Project
        </Button>
      </div>

      {/* Submission Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Project' : 'Submit New Project'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project_name">Project Name</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    placeholder="e.g., TI-3A"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group_class">Group Class</Label>
                  <Input
                    id="group_class"
                    value={formData.group_class}
                    onChange={(e) => setFormData({...formData, group_class: e.target.value})}
                    placeholder="e.g., Group 1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    placeholder="e.g., Rekayasa Perangkat Lunak"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lecturer">Lecturer</Label>
                  <Input
                    id="lecturer"
                    value={formData.lecturer}
                    onChange={(e) => setFormData({...formData, lecturer: e.target.value})}
                    placeholder="e.g., Dr. John Doe, M.T."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade (Optional)</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    placeholder="e.g., A, B+, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program_study">Program Study</Label>
                <Select 
                  value={formData.program_study} 
                  onValueChange={(value) => setFormData({...formData, program_study: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Program Study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teknik Informatika">Teknik Informatika</SelectItem>
                    <SelectItem value="Sistem Informasi">Sistem Informasi</SelectItem>
                    <SelectItem value="Teknik Komputer">Teknik Komputer</SelectItem>
                    <SelectItem value="Multimedia dan Jaringan">Multimedia dan Jaringan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Project Document (PDF)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({...formData, document: e.target.files?.[0] || null})}
                    className="flex-1"
                  />
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  disabled={loading || uploadingFile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (uploadingFile ? "Uploading..." : "Saving...") : editingId ? "Update Project" : "Submit Project"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No project submissions yet.</p>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{submission.project_name}</CardTitle>
                    <p className="text-slate-600 mt-1">
                      {submission.course} - {submission.class} ({submission.group_class})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(submission.status)}
                    {submission.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(submission)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(submission.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Lecturer:</strong> {submission.lecturer}</p>
                    <p><strong>Program Study:</strong> {submission.program_study}</p>
                    {submission.grade && <p><strong>Grade:</strong> {submission.grade}</p>}
                  </div>
                  <div>
                    {submission.document_url && (
                      <p>
                        <strong>Document:</strong> 
                        <a 
                          href={submission.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          View Document
                        </a>
                      </p>
                    )}
                    <p><strong>Submitted:</strong> {new Date(submission.created_at).toLocaleDateString()}</p>
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
    </div>
  );
};

export default StudentDashboard;
