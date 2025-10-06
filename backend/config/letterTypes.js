/**
 * Letter Types Configuration
 * 30+ types of letters that students can request
 */

const letterTypes = [
  {
    code: 'SKA',
    name: 'Surat Keterangan Aktif Kuliah',
    description: 'Surat keterangan bahwa mahasiswa masih aktif kuliah',
    requiredFields: ['semester', 'tahun_akademik'],
  },
  {
    code: 'SKPI',
    name: 'Surat Keterangan Pendamping Ijazah',
    description: 'Surat keterangan pendamping ijazah',
    requiredFields: ['ipk', 'jumlah_sks'],
  },
  {
    code: 'SKL',
    name: 'Surat Keterangan Lulus',
    description: 'Surat keterangan kelulusan mahasiswa',
    requiredFields: ['tanggal_lulus', 'ipk'],
  },
  {
    code: 'SKMB',
    name: 'Surat Keterangan Mahasiswa Baru',
    description: 'Surat keterangan untuk mahasiswa baru',
    requiredFields: ['tahun_masuk', 'jalur_masuk'],
  },
  {
    code: 'SKP',
    name: 'Surat Keterangan Penelitian',
    description: 'Surat izin penelitian untuk tugas akhir/skripsi',
    requiredFields: ['judul_penelitian', 'lokasi_penelitian', 'tanggal_mulai', 'tanggal_selesai'],
  },
  {
    code: 'SKM',
    name: 'Surat Keterangan Magang',
    description: 'Surat pengantar magang/PKL',
    requiredFields: ['nama_perusahaan', 'alamat_perusahaan', 'tanggal_mulai', 'tanggal_selesai'],
  },
  {
    code: 'SKCUTI',
    name: 'Surat Keterangan Cuti Akademik',
    description: 'Surat keterangan cuti akademik',
    requiredFields: ['semester_cuti', 'alasan_cuti'],
  },
  {
    code: 'SKPB',
    name: 'Surat Keterangan Pindah Kampus',
    description: 'Surat keterangan untuk pindah ke kampus lain',
    requiredFields: ['kampus_tujuan', 'alasan_pindah'],
  },
  {
    code: 'SKBS',
    name: 'Surat Keterangan Bebas Sanksi',
    description: 'Surat keterangan bebas dari sanksi akademik',
    requiredFields: [],
  },
  {
    code: 'SKBP',
    name: 'Surat Keterangan Bebas Pinjaman',
    description: 'Surat keterangan bebas pinjaman perpustakaan',
    requiredFields: [],
  },
  {
    code: 'SKT',
    name: 'Surat Keterangan Transkrip Nilai',
    description: 'Surat pengantar transkrip nilai',
    requiredFields: ['semester_terakhir', 'ipk'],
  },
  {
    code: 'SKBEA',
    name: 'Surat Keterangan Beasiswa',
    description: 'Surat keterangan penerima beasiswa',
    requiredFields: ['jenis_beasiswa', 'periode'],
  },
  {
    code: 'SKORG',
    name: 'Surat Keterangan Organisasi',
    description: 'Surat keterangan aktif di organisasi kampus',
    requiredFields: ['nama_organisasi', 'jabatan', 'periode'],
  },
  {
    code: 'SKPRES',
    name: 'Surat Keterangan Prestasi',
    description: 'Surat keterangan prestasi akademik/non-akademik',
    requiredFields: ['jenis_prestasi', 'tingkat', 'tahun'],
  },
  {
    code: 'SKIZIN',
    name: 'Surat Izin Kegiatan',
    description: 'Surat izin untuk mengadakan kegiatan',
    requiredFields: ['nama_kegiatan', 'tanggal_kegiatan', 'tempat_kegiatan'],
  },
  {
    code: 'SKPENG',
    name: 'Surat Pengantar',
    description: 'Surat pengantar umum',
    requiredFields: ['tujuan', 'keperluan'],
  },
  {
    code: 'SKREK',
    name: 'Surat Rekomendasi',
    description: 'Surat rekomendasi dari dosen/fakultas',
    requiredFields: ['tujuan_rekomendasi', 'keperluan'],
  },
  {
    code: 'SKWIS',
    name: 'Surat Keterangan Wisuda',
    description: 'Surat keterangan untuk keperluan wisuda',
    requiredFields: ['periode_wisuda', 'tanggal_lulus'],
  },
  {
    code: 'SKALUM',
    name: 'Surat Keterangan Alumni',
    description: 'Surat keterangan sebagai alumni',
    requiredFields: ['tahun_lulus', 'gelar'],
  },
  {
    code: 'SKDUP',
    name: 'Surat Keterangan Duplikat Ijazah',
    description: 'Surat pengantar untuk duplikat ijazah yang hilang',
    requiredFields: ['nomor_ijazah_asli', 'alasan_duplikat'],
  },
  {
    code: 'SKKHS',
    name: 'Surat Keterangan KHS',
    description: 'Surat pengantar Kartu Hasil Studi',
    requiredFields: ['semester'],
  },
  {
    code: 'SKKRS',
    name: 'Surat Keterangan KRS',
    description: 'Surat pengantar Kartu Rencana Studi',
    requiredFields: ['semester'],
  },
  {
    code: 'SKPMB',
    name: 'Surat Keterangan Pembayaran',
    description: 'Surat keterangan lunas pembayaran',
    requiredFields: ['jenis_pembayaran', 'periode'],
  },
  {
    code: 'SKVER',
    name: 'Surat Keterangan Verifikasi Data',
    description: 'Surat verifikasi data mahasiswa',
    requiredFields: [],
  },
  {
    code: 'SKLAB',
    name: 'Surat Izin Penggunaan Laboratorium',
    description: 'Surat izin menggunakan fasilitas laboratorium',
    requiredFields: ['nama_lab', 'tanggal_penggunaan', 'keperluan'],
  },
  {
    code: 'SKPUS',
    name: 'Surat Izin Penggunaan Perpustakaan',
    description: 'Surat izin akses perpustakaan',
    requiredFields: ['keperluan'],
  },
  {
    code: 'SKSEM',
    name: 'Surat Keterangan Seminar',
    description: 'Surat keterangan mengikuti seminar',
    requiredFields: ['nama_seminar', 'tanggal_seminar'],
  },
  {
    code: 'SKKOM',
    name: 'Surat Keterangan Kompetisi',
    description: 'Surat keterangan mengikuti kompetisi',
    requiredFields: ['nama_kompetisi', 'tingkat', 'tanggal'],
  },
  {
    code: 'SKKP',
    name: 'Surat Keterangan Kerja Praktek',
    description: 'Surat pengantar kerja praktek',
    requiredFields: ['nama_perusahaan', 'alamat_perusahaan', 'tanggal_mulai', 'tanggal_selesai'],
  },
  {
    code: 'SKTA',
    name: 'Surat Keterangan Tugas Akhir',
    description: 'Surat keterangan sedang mengerjakan tugas akhir',
    requiredFields: ['judul_ta', 'dosen_pembimbing'],
  },
  {
    code: 'SKMHS',
    name: 'Surat Keterangan Mahasiswa',
    description: 'Surat keterangan umum sebagai mahasiswa',
    requiredFields: ['keperluan'],
  },
];

/**
 * Get letter type by code
 * @param {String} code - Letter type code
 * @returns {Object|null} Letter type object or null
 */
const getLetterTypeByCode = (code) => {
  return letterTypes.find(type => type.code === code) || null;
};

/**
 * Get all letter types
 * @returns {Array} Array of all letter types
 */
const getAllLetterTypes = () => {
  return letterTypes;
};

/**
 * Validate if letter type code exists
 * @param {String} code - Letter type code
 * @returns {Boolean} True if exists
 */
const isValidLetterType = (code) => {
  return letterTypes.some(type => type.code === code);
};

module.exports = {
  letterTypes,
  getLetterTypeByCode,
  getAllLetterTypes,
  isValidLetterType,
};
