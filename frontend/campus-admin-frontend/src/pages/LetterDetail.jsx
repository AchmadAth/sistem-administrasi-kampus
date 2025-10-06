import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { lettersAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User, Calendar, Loader2 } from 'lucide-react';

export default function LetterDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [letter, setLetter] = useState(null);
  const [letterTypeInfo, setLetterTypeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLetterDetail();
  }, [id]);

  const fetchLetterDetail = async () => {
    try {
      const response = await lettersAPI.getById(id);
      setLetter(response.data.data.letter);
      setLetterTypeInfo(response.data.data.letterTypeInfo);
    } catch (error) {
      setError('Gagal memuat detail surat');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await lettersAPI.updateStatus(id, { status: 'approved' });
      await fetchLetterDetail();
    } catch (error) {
      setError('Gagal menyetujui surat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Alasan penolakan harus diisi');
      return;
    }

    setActionLoading(true);
    try {
      await lettersAPI.updateStatus(id, {
        status: 'rejected',
        rejectionReason,
      });
      setShowRejectDialog(false);
      await fetchLetterDetail();
    } catch (error) {
      setError('Gagal menolak surat');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus permohonan ini?')) {
      return;
    }

    try {
      await lettersAPI.delete(id);
      navigate('/letters');
    } catch (error) {
      setError('Gagal menghapus surat');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', icon: Clock, text: 'Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      approved: { variant: 'default', icon: CheckCircle, text: 'Disetujui', color: 'bg-green-50 text-green-700 border-green-200' },
      rejected: { variant: 'destructive', icon: XCircle, text: 'Ditolak', color: 'bg-red-50 text-red-700 border-red-200' },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color}`}>
        <Icon className="h-5 w-5" />
        <span className="font-medium">{config.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!letter) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>Surat tidak ditemukan</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const canApprove = (user?.role === 'supervisor' || user?.role === 'admin') && letter.status === 'pending';
  const canDelete = user?.role === 'student' && letter.status === 'pending' && letter.userId === user?.id;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/letters')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detail Permohonan Surat</h1>
              <p className="text-gray-600 mt-1">ID: {letter.id}</p>
            </div>
          </div>
          {getStatusBadge(letter.status)}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Letter Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Surat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Jenis Surat</Label>
                <p className="font-medium mt-1">{letterTypeInfo?.name || letter.letterType}</p>
                <p className="text-sm text-gray-500 mt-1">{letterTypeInfo?.description}</p>
              </div>
              
              {letter.letterNumber && (
                <div>
                  <Label className="text-gray-600">Nomor Surat</Label>
                  <p className="font-mono font-medium mt-1 text-blue-600">{letter.letterNumber}</p>
                </div>
              )}
              
              <div>
                <Label className="text-gray-600">Tanggal Pengajuan</Label>
                <p className="font-medium mt-1">
                  {new Date(letter.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {letter.approvedAt && (
                <div>
                  <Label className="text-gray-600">Tanggal Disetujui</Label>
                  <p className="font-medium mt-1">
                    {new Date(letter.approvedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>

            {letter.purpose && (
              <div>
                <Label className="text-gray-600">Tujuan Penggunaan</Label>
                <p className="mt-1">{letter.purpose}</p>
              </div>
            )}

            {letter.notes && (
              <div>
                <Label className="text-gray-600">Catatan</Label>
                <p className="mt-1">{letter.notes}</p>
              </div>
            )}

            {letter.additionalData && Object.keys(letter.additionalData).length > 0 && (
              <div>
                <Label className="text-gray-600">Data Tambahan</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-2">
                  {Object.entries(letter.additionalData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pemohon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Nama</Label>
                <p className="font-medium mt-1">{letter.user?.name}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="font-medium mt-1">{letter.user?.email}</p>
              </div>
              {letter.user?.nim && (
                <div>
                  <Label className="text-gray-600">NIM</Label>
                  <p className="font-medium mt-1">{letter.user.nim}</p>
                </div>
              )}
              {letter.user?.nip && (
                <div>
                  <Label className="text-gray-600">NIP</Label>
                  <p className="font-medium mt-1">{letter.user.nip}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rejection Reason */}
        {letter.status === 'rejected' && letter.rejectionReason && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Alasan Penolakan:</strong> {letter.rejectionReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canApprove && (
            <>
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Setujui
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={actionLoading}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Tolak
              </Button>
            </>
          )}
          
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Hapus Permohonan
            </Button>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Permohonan Surat</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan alasan penolakan untuk permohonan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejectionReason">Alasan Penolakan *</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Jelaskan alasan penolakan..."
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Tolak Permohonan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
