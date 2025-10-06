import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lettersAPI } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function NewLetter() {
  const navigate = useNavigate();
  const [letterTypes, setLetterTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    letterType: '',
    purpose: '',
    notes: '',
    additionalData: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLetterTypes();
  }, []);

  const fetchLetterTypes = async () => {
    try {
      const response = await lettersAPI.getTypes();
      setLetterTypes(response.data.data.letterTypes);
    } catch (error) {
      console.error('Error fetching letter types:', error);
    }
  };

  const handleTypeChange = (value) => {
    const type = letterTypes.find(t => t.code === value);
    setSelectedType(type);
    setFormData({ ...formData, letterType: value, additionalData: {} });
  };

  const handleAdditionalDataChange = (field, value) => {
    setFormData({
      ...formData,
      additionalData: {
        ...formData.additionalData,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await lettersAPI.create(formData);
      navigate(`/letters/${response.data.data.letter.id}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal membuat permohonan surat');
      if (error.response?.data?.missingFields) {
        setError(`Field yang diperlukan: ${error.response.data.missingFields.join(', ')}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/letters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Buat Permohonan Surat Baru</h1>
            <p className="text-gray-600 mt-1">Isi formulir di bawah untuk membuat permohonan</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulir Permohonan</CardTitle>
            <CardDescription>
              Pastikan semua informasi yang Anda masukkan sudah benar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="letterType">Jenis Surat *</Label>
                <Select 
                  value={formData.letterType} 
                  onValueChange={handleTypeChange}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis surat" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {letterTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        <div>
                          <p className="font-medium">{type.name}</p>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedType && selectedType.requiredFields.length > 0 && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-sm text-blue-900">
                    Informasi Tambahan yang Diperlukan:
                  </p>
                  {selectedType.requiredFields.map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="capitalize">
                        {field.replace(/_/g, ' ')} *
                      </Label>
                      <Input
                        id={field}
                        value={formData.additionalData[field] || ''}
                        onChange={(e) => handleAdditionalDataChange(field, e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan Penggunaan</Label>
                <Textarea
                  id="purpose"
                  placeholder="Jelaskan tujuan penggunaan surat ini..."
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Tambahan</Label>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/letters')}
                  disabled={loading}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.letterType}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Ajukan Permohonan'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
