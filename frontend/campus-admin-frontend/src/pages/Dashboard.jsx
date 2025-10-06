import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { lettersAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentLetters, setRecentLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await lettersAPI.getAll({ limit: 5 });
      const letters = response.data.data.letters;
      
      setRecentLetters(letters);
      
      // Calculate stats
      const statsData = {
        total: letters.length,
        pending: letters.filter(l => l.status === 'pending').length,
        approved: letters.filter(l => l.status === 'approved').length,
        rejected: letters.filter(l => l.status === 'rejected').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', icon: Clock, text: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, text: 'Disetujui' },
      rejected: { variant: 'destructive', icon: XCircle, text: 'Ditolak' },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Selamat datang, {user?.name}
            </p>
          </div>
          {user?.role === 'student' && (
            <Button onClick={() => navigate('/letters/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Permohonan Surat
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Surat</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Letters */}
        <Card>
          <CardHeader>
            <CardTitle>Surat Terbaru</CardTitle>
            <CardDescription>
              {user?.role === 'student' 
                ? 'Permohonan surat Anda yang terbaru'
                : 'Permohonan surat terbaru dari mahasiswa'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Memuat data...</p>
            ) : recentLetters.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada data surat</p>
            ) : (
              <div className="space-y-4">
                {recentLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate(`/letters/${letter.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{letter.letterType}</p>
                          {letter.user && (
                            <p className="text-sm text-gray-600">
                              {letter.user.name} • {letter.user.nim || letter.user.nip}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {letter.letterNumber && (
                        <span className="text-sm font-mono text-gray-600">
                          {letter.letterNumber}
                        </span>
                      )}
                      {getStatusBadge(letter.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {recentLetters.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => navigate('/letters')}>
                  Lihat Semua Surat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
