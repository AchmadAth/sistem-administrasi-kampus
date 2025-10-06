import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lettersAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Search, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Letters() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLetters();
  }, [statusFilter]);

  const fetchLetters = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await lettersAPI.getAll(params);
      setLetters(response.data.data.letters);
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', icon: Clock, text: 'Pending', color: 'text-yellow-600' },
      approved: { variant: 'default', icon: CheckCircle, text: 'Disetujui', color: 'text-green-600' },
      rejected: { variant: 'destructive', icon: XCircle, text: 'Ditolak', color: 'text-red-600' },
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

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = 
      letter.letterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.letterNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Daftar Surat</h1>
            <p className="text-gray-600 mt-1">
              Kelola permohonan surat
            </p>
          </div>
          {user?.role === 'student' && (
            <Button onClick={() => navigate('/letters/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Permohonan Baru
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan jenis surat, nama, atau nomor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Letters List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredLetters.length} Surat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-8">Memuat data...</p>
            ) : filteredLetters.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada surat ditemukan</p>
                {user?.role === 'student' && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/letters/new')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Permohonan Pertama
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => navigate(`/letters/${letter.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{letter.letterType}</p>
                          {letter.user && (
                            <p className="text-sm text-gray-600">
                              {letter.user.name} • {letter.user.nim || letter.user.nip}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(letter.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {letter.letterNumber && (
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
                          {letter.letterNumber}
                        </span>
                      )}
                      {getStatusBadge(letter.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
