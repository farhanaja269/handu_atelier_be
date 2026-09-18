.-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: handu_atelier
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `no_whatsapp` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_admin`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'Administrator','081234567890','admin123');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_percakapan`
--

DROP TABLE IF EXISTS `chat_percakapan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_percakapan` (
  `id_percakapan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pelanggan` int(11) NOT NULL,
  `id_petugas` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_percakapan`),
  UNIQUE KEY `uk_chat_pelanggan` (`id_pelanggan`),
  KEY `idx_chat_petugas` (`id_petugas`),
  KEY `idx_chat_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_percakapan`
--

LOCK TABLES `chat_percakapan` WRITE;
/*!40000 ALTER TABLE `chat_percakapan` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_percakapan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_pesan`
--

DROP TABLE IF EXISTS `chat_pesan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_pesan` (
  `id_pesan` int(11) NOT NULL AUTO_INCREMENT,
  `id_percakapan` int(11) NOT NULL,
  `id_pengirim` int(11) NOT NULL,
  `pesan` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'terkirim',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_pesan`),
  KEY `idx_chat_pesan_percakapan` (`id_percakapan`),
  KEY `idx_chat_pesan_pengirim` (`id_pengirim`),
  KEY `idx_chat_pesan_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_pesan`
--

LOCK TABLES `chat_pesan` WRITE;
/*!40000 ALTER TABLE `chat_pesan` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_pesan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denda`
--

DROP TABLE IF EXISTS `denda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `denda` (
  `id_denda` int(11) NOT NULL AUTO_INCREMENT,
  `id_pengembalian` int(11) NOT NULL,
  `nominal_denda` decimal(12,2) NOT NULL DEFAULT 0.00,
  `alasan` text DEFAULT NULL,
  `status` enum('Belum Dibayar','Menunggu Verifikasi','Lunas','Ditolak') NOT NULL DEFAULT 'Belum Dibayar',
  `dibuat_oleh` int(11) DEFAULT NULL,
  `diperbarui_oleh` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_denda`),
  KEY `idx_denda_pengembalian` (`id_pengembalian`),
  KEY `idx_denda_dibuat_oleh` (`dibuat_oleh`),
  KEY `idx_denda_diperbarui_oleh` (`diperbarui_oleh`),
  CONSTRAINT `fk_denda_dibuat_oleh` FOREIGN KEY (`dibuat_oleh`) REFERENCES `petugas` (`id_petugas`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_denda_diperbarui_oleh` FOREIGN KEY (`diperbarui_oleh`) REFERENCES `petugas` (`id_petugas`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_denda_pengembalian` FOREIGN KEY (`id_pengembalian`) REFERENCES `pengembalian` (`id_pengembalian`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denda`
--

LOCK TABLES `denda` WRITE;
/*!40000 ALTER TABLE `denda` DISABLE KEYS */;
INSERT INTO `denda` VALUES (1,6,300000.00,'rusak pwoll','Belum Dibayar',1,1,'2026-09-17 09:31:46','2026-09-17 09:46:44');
/*!40000 ALTER TABLE `denda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detail_peminjaman`
--

DROP TABLE IF EXISTS `detail_peminjaman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detail_peminjaman` (
  `id_detail` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjaman` int(11) NOT NULL,
  `id_kostum` int(11) NOT NULL,
  `jumlah` int(11) DEFAULT 1,
  `harga` decimal(12,2) DEFAULT NULL,
  `subtotal` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id_detail`),
  KEY `fk_detail_pinjam` (`id_peminjaman`),
  KEY `fk_detail_kostum` (`id_kostum`),
  CONSTRAINT `fk_detail_kostum` FOREIGN KEY (`id_kostum`) REFERENCES `kostum` (`id_kostum`) ON UPDATE CASCADE,
  CONSTRAINT `fk_detail_pinjam` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detail_peminjaman`
--

LOCK TABLES `detail_peminjaman` WRITE;
/*!40000 ALTER TABLE `detail_peminjaman` DISABLE KEYS */;
INSERT INTO `detail_peminjaman` VALUES (10,11,20,137,450000.00,61650000.00),(11,12,16,21,275000.00,5775000.00),(12,2,20,137,450000.00,61650000.00),(13,3,20,137,450000.00,61650000.00),(14,4,20,137,450000.00,61650000.00),(15,5,20,137,450000.00,61650000.00),(16,6,20,137,450000.00,61650000.00),(17,7,20,137,450000.00,61650000.00),(18,8,20,137,450000.00,61650000.00),(19,9,20,137,450000.00,61650000.00),(20,10,20,137,450000.00,61650000.00),(27,13,30,1,350000.00,18200000.00),(28,14,20,1,450000.00,13950000.00),(29,15,6,1,175000.00,5425000.00),(30,16,15,1,150000.00,9450000.00),(31,17,8,1,175000.00,11025000.00),(32,18,10,1,160000.00,4960000.00),(33,19,35,1,200000.00,1600000.00),(34,20,3,1,120000.00,6360000.00),(35,21,10,1,160000.00,160000.00),(36,22,38,1,175000.00,5600000.00),(37,23,1,1,150000.00,5550000.00),(38,24,35,1,200000.00,7400000.00),(39,25,35,1,200000.00,7400000.00),(40,26,35,1,200000.00,200000.00),(41,28,37,1,170000.00,5100000.00),(42,30,1,1,150000.00,150000.00),(43,31,34,1,200000.00,5600000.00),(44,32,34,1,200000.00,5600000.00),(45,33,9,1,150000.00,5550000.00),(46,34,9,1,150000.00,5550000.00),(47,35,37,1,170000.00,170000.00);
/*!40000 ALTER TABLE `detail_peminjaman` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dokumen_jaminan`
--

DROP TABLE IF EXISTS `dokumen_jaminan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dokumen_jaminan` (
  `id_dokumen_jaminan` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjaman` int(11) NOT NULL,
  `jenis_dokumen` enum('KTP','Kartu Keluarga') NOT NULL,
  `nama_file` varchar(255) NOT NULL,
  `path_file` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `ukuran_file` int(11) NOT NULL,
  `status` enum('Menunggu Verifikasi','Terverifikasi','Ditolak') NOT NULL DEFAULT 'Menunggu Verifikasi',
  `diverifikasi_oleh` int(11) DEFAULT NULL,
  `tanggal_verifikasi` datetime DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_dokumen_jaminan`),
  KEY `fk_dokumen_jaminan_peminjaman` (`id_peminjaman`),
  CONSTRAINT `fk_dokumen_jaminan_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dokumen_jaminan`
--

LOCK TABLES `dokumen_jaminan` WRITE;
/*!40000 ALTER TABLE `dokumen_jaminan` DISABLE KEYS */;
INSERT INTO `dokumen_jaminan` VALUES (1,35,'KTP','1789622019686-screenshot--79-.png','uploads/dokumen-jaminan/1789622019686-screenshot--79-.png','image/png',286688,'Menunggu Verifikasi',NULL,NULL,NULL,'2026-09-17 05:13:40','2026-09-17 05:13:40');
/*!40000 ALTER TABLE `dokumen_jaminan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kategori`
--

DROP TABLE IF EXISTS `kategori`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kategori` varchar(100) NOT NULL,
  PRIMARY KEY (`id_kategori`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kategori`
--

LOCK TABLES `kategori` WRITE;
/*!40000 ALTER TABLE `kategori` DISABLE KEYS */;
INSERT INTO `kategori` VALUES (2,'Jas'),(4,'Dress'),(5,'Batik'),(6,'Baju Adat'),(11,'halloween'),(12,'Setelan'),(13,'Pengantin');
/*!40000 ALTER TABLE `kategori` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `koleksi`
--

DROP TABLE IF EXISTS `koleksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `koleksi` (
  `id_koleksi` int(11) NOT NULL AUTO_INCREMENT,
  `nama_koleksi` varchar(100) NOT NULL,
  `jumlah_kostum` int(11) NOT NULL DEFAULT 0,
  `foto` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `status` enum('Aktif','Tidak Aktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_koleksi`),
  UNIQUE KEY `unique_nama_koleksi` (`nama_koleksi`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `koleksi`
--

LOCK TABLES `koleksi` WRITE;
/*!40000 ALTER TABLE `koleksi` DISABLE KEYS */;
INSERT INTO `koleksi` VALUES (1,'Tradisional',15,'/uploads/koleksi/traditional.jpg','Koleksi busana adat Indonesia dengan karakter khas daerah, mulai dari Minangkabau, Jawa, hingga pakaian tradisional Nusantara.','Aktif','2026-08-29 05:16:30','2026-09-02 01:25:35'),(2,'Modern',8,'/uploads/koleksi/modern.jpg','Koleksi modern dengan siluet elegan dan gaya kontemporer untuk pesta, pernikahan, penghargaan maupun acara spesial.','Aktif','2026-08-29 05:16:30','2026-09-02 01:29:10'),(3,'Classic',6,'/uploads/koleksi/classic.jpg','Koleksi klasik bernuansa vintage, Eropa, dan kerajaan dengan karakter elegan yang timeless.','Aktif','2026-08-29 05:16:30','2026-09-02 01:29:31'),(4,'Formal',6,'/uploads/koleksi/formal.jpg','Koleksi formal dengan potongan elegan dan profesional untuk acara resmi, gala, pertemuan hingga acara spesial.','Aktif','2026-08-29 05:16:30','2026-09-02 01:50:13'),(7,'Profesi',0,'/uploads/koleksi/dokter.jpg','Kostum profesi adalah pakaian atau seragam khusus yang menunjukkan jenis pekerjaan atau jabatan tertentu.','Aktif','2026-09-03 01:53:06','2026-09-03 01:53:06');
/*!40000 ALTER TABLE `koleksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kostum`
--

DROP TABLE IF EXISTS `kostum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kostum` (
  `id_kostum` int(11) NOT NULL AUTO_INCREMENT,
  `id_kategori` int(11) NOT NULL,
  `id_koleksi` int(11) DEFAULT NULL,
  `kode_koleksi` varchar(10) NOT NULL,
  `nama_kostum` varchar(100) NOT NULL,
  `ukuran` enum('XS','S','M','L','XL','XXL') DEFAULT NULL,
  `warna` varchar(50) DEFAULT NULL,
  `stok` int(11) DEFAULT 0,
  `harga_sewa` decimal(12,2) NOT NULL,
  `status` enum('Tersedia','Dipinjam','Perawatan','Rusak') DEFAULT 'Tersedia',
  `foto` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_kostum`),
  KEY `idx_id_kategori` (`id_kategori`),
  KEY `fk_kostum_koleksi` (`id_koleksi`),
  CONSTRAINT `fk_kostum_kategori` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON UPDATE CASCADE,
  CONSTRAINT `fk_kostum_koleksi` FOREIGN KEY (`id_koleksi`) REFERENCES `koleksi` (`id_koleksi`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kostum`
--

LOCK TABLES `kostum` WRITE;
/*!40000 ALTER TABLE `kostum` DISABLE KEYS */;
INSERT INTO `kostum` VALUES (1,6,1,'KST-001','Ageng Kanigaran','L','Netral',2,150000.00,'Tersedia','/uploads/kostum/ageng-kanigaran.jpeg','Busana tradisional Ageng Kanigaran.',1),(2,6,1,'KST-002','Baju Tari Badestar','M','Ungu Emas',1,120000.00,'Tersedia','/uploads/kostum/baju-tari-badestar.jpeg','Kostum tari Badestar.',0),(3,5,1,'KST-003','Baju Tari Kapalo Batik Kucing','L','Batik',1,120000.00,'Tersedia','/uploads/kostum/baju-tari-kapalo-batik-kucing.jpeg','Kostum tari dengan motif batik kucing.',0),(4,6,1,'KST-004','Basiba Tingkuluak Kopong','S','Tradisional',1,130000.00,'Tersedia','/uploads/kostum/basiba-tingkuluak-kopong.jpeg','Busana tradisional Basiba Tingkuluak Kopong.',0),(5,2,4,'KST-005','Blazer','XL','Hitam',2,100000.00,'Tersedia','/uploads/kostum/blazer.jpeg','Blazer formal.',0),(6,4,3,'KST-006','Bridgerton Kostum','M','Bervariasi',2,175000.00,'Tersedia','/uploads/kostum/bridgerton-kostum.jpeg','Kostum bergaya era Bridgerton.',0),(7,4,2,'KST-007','Dress Awards Hijab','L','Bervariasi',2,175000.00,'Tersedia','/uploads/kostum/dress-awards-hijab.jpeg','Dress formal dengan hijab.',0),(8,4,2,'KST-008','Dress Awards Non Hijab','L','Bervariasi',1,175000.00,'Tersedia','/uploads/kostum/dress-awards-non-hijab.jpeg','Dress formal tanpa hijab.',0),(9,4,4,'KST-009','Dress Korean Style','S','Bervariasi',1,150000.00,'Tersedia','/uploads/kostum/dress-korean-style.jpeg','Dress bergaya Korea.',1),(10,4,3,'KST-010','Dress Noni Belanda Vintage','M','Vintage',1,160000.00,'Tersedia','/uploads/kostum/dress-noni-belanda-vintage.jpeg','Dress bergaya Noni Belanda vintage.',1),(11,4,3,'KST-011','Dress Vintage Eropa Italian','M','Vintage',1,160000.00,'Tersedia','/uploads/kostum/dress-vintage-eropa-italian.jpeg','Dress vintage bergaya Eropa Italia.',0),(12,4,3,'KST-012','Dress Vintage Kerajaan','L','Vintage',2,180000.00,'Tersedia','/uploads/kostum/dress-vintage-kerajaan.jpeg','Dress bergaya kerajaan klasik.',0),(13,4,3,'KST-013','French Style Retro','M','Retro',1,150000.00,'Tersedia','/uploads/kostum/french-style-retro.jpeg','Kostum bergaya Prancis retro.',0),(14,2,2,'KST-014','Glam Outfit Men','XL','Bervariasi',3,150000.00,'Tersedia','/uploads/kostum/glam-outfit-men.jpeg','Outfit formal glamor pria.',0),(15,4,4,'KST-015','Guide Formal Attire Wanita','M','Bervariasi',4,150000.00,'Tersedia','/uploads/kostum/guide-formal-attire-wanita.jpeg','Busana formal wanita.',0),(16,11,3,'KST-016','Halloween Kostum','M','Bervariasi',3,150000.00,'Tersedia','/uploads/kostum/halloween-kostum.jpeg','Kostum bertema Halloween.',0),(17,4,4,'KST-017','House Off Cuff Housecuff','L','Bervariasi',5,140000.00,'Tersedia','/uploads/kostum/house-off-cuff-housecuff.jpeg','Kostum fashion.',0),(18,2,2,'KST-018','Jas Pria Hitam','XL','Hitam',1,150000.00,'Tersedia','/uploads/kostum/jas-pria-hitam.jpeg','Jas pria warna hitam.',0),(19,2,2,'KST-019','Jas Pria Hitam Putih','XL','Hitam Putih',1,150000.00,'Tersedia','/uploads/kostum/jas-pria-hitam-putih.jpeg','Jas pria kombinasi hitam dan putih.',0),(20,2,2,'KST-020','Jas Pria Putih','L','Putih',1,150000.00,'Tersedia','/uploads/kostum/jas-pria-putih.jpeg','Jas pria warna putih.',1),(21,6,1,'KST-021','Jogja Putri','M','Tradisional',2,140000.00,'Tersedia','/uploads/kostum/jogja-putri.jpeg','Busana tradisional Jogja Putri.',0),(22,6,1,'KST-022','Paes Ageng Jangkep','M','Tradisional',1,180000.00,'Tersedia','/uploads/kostum/paes-ageng-jangkep.jpeg','Busana tradisional Paes Ageng Jangkep.',0),(23,6,1,'KST-023','Pakaian Adat Solo Putri','M','Tradisional',0,150000.00,'Tersedia','/uploads/kostum/pakaian-adat-solo-putri.jpeg','Pakaian adat Solo Putri.',0),(24,4,4,'KST-024','Semi Formal','L','Bervariasi',1,120000.00,'Tersedia','/uploads/kostum/semi-formal.jpeg','Busana semi formal.',0),(25,6,1,'KST-025','Siger Jawa','M','Tradisional',1,150000.00,'Tersedia','/uploads/kostum/siger-jawa.jpeg','Busana tradisional dengan siger Jawa.',0),(26,6,1,'KST-026','Suntiang Pariaman','S','Tradisional',1,160000.00,'Tersedia','/uploads/kostum/suntiang-pariaman.jpeg','Busana tradisional Suntiang Pariaman.',0),(27,6,1,'KST-027','Suntiang Solok','M','Tradisional',1,160000.00,'Tersedia','/uploads/kostum/suntiang-solok.jpeg','Busana tradisional Suntiang Solok.',0),(28,6,1,'KST-028','Suntiang Taram','S','Tradisional',2,160000.00,'Tersedia','/uploads/kostum/suntiang-taram.jpeg','Busana tradisional Suntiang Taram.',0),(29,5,1,'KST-029','Tingkuluak Kopong Batik','M','Batik',1,140000.00,'Tersedia','/uploads/kostum/tingkuluak-kopong-batik.jpeg','Busana tradisional dengan motif batik.',0),(30,6,1,'KST-030','Tingkuluak Koto Gadang','L','Tradisional',1,150000.00,'Tersedia','/uploads/kostum/tingkuluak-koto-gadang.jpeg','Busana tradisional Tingkuluak Koto Gadang.',0),(31,6,1,'KST-031','Tingkuluak Lenggek','M','Tradisional',1,150000.00,'Tersedia','/uploads/kostum/tingkuluak-lenggek.jpeg','Busana tradisional Tingkuluak Lenggek.',0),(32,6,1,'KST-032','Tingkuluak Tanduak','M','Tradisional',3,150000.00,'Tersedia','/uploads/kostum/tingkuluak-tanduak.jpeg','Busana tradisional Tingkuluak Tanduak.',0),(33,2,4,'KST-033','Tuxedo','XL','Hitam',1,180000.00,'Tersedia','/uploads/kostum/tuxedo.jpeg','Tuxedo formal pria.',0),(34,4,2,'KST-034','Wedding Dress Hijab','L','Putih',2,200000.00,'Tersedia','/uploads/kostum/wedding-dress-hijab.jpeg','Wedding dress dengan hijab.',1),(35,4,2,'KST-035','Wedding Dress Non Hijab','M','Putih',0,200000.00,'Tersedia','/uploads/kostum/wedding-dress-non-hijab.jpeg','Wedding dress tanpa hijab.',1),(36,11,3,'KST-036','The Nun','L','Hitam',2,200000.00,'Tersedia','the-nun.jpeg','Kostum halloween menyeramkan.',0),(37,11,3,'KST-037','Silent HIill Nurse','S','Putih Merah',3,170000.00,'Tersedia','silent-hiill-nurse.jpeg','Kostum Wanita Di Silent Hill',1),(38,12,7,'KST-038','Pilot','L','Hitam Putih',1,175000.00,'Tersedia','pilot.jpeg','Setelan untuk profesi pilot.',0);
/*!40000 ALTER TABLE `kostum` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifikasi`
--

DROP TABLE IF EXISTS `notifikasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifikasi` (
  `id_notifikasi` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `pesan` text NOT NULL,
  `status` enum('Belum Dibaca','Sudah Dibaca') DEFAULT 'Belum Dibaca',
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notifikasi`),
  KEY `fk_notif_user` (`id_user`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifikasi`
--

LOCK TABLES `notifikasi` WRITE;
/*!40000 ALTER TABLE `notifikasi` DISABLE KEYS */;
INSERT INTO `notifikasi` VALUES (1,7,'Pengajuan peminjaman baru #14 dari user ID 5. Status: Menunggu.','Sudah Dibaca','2026-08-28 15:30:37'),(2,7,'Pengajuan peminjaman baru #15 dari user ID 5. Tanggal pinjam: 2026-09-09. Tanggal kembali: 2026-10-10. Status: Menunggu.','Sudah Dibaca','2026-09-02 09:06:51'),(3,7,'Pengajuan peminjaman baru #16 dari user ID 5. Tanggal pinjam: 2026-09-09. Tanggal kembali: 2026-11-11. Status: Menunggu.','Sudah Dibaca','2026-09-02 10:55:56'),(4,7,'Pembayaran baru untuk peminjaman #16. Status pembayaran: Belum Bayar.','Sudah Dibaca','2026-09-02 10:55:57'),(5,7,'Pengajuan peminjaman baru #17 dari user ID 5. Tanggal pinjam: 2026-09-09. Tanggal kembali: 2026-11-11. Status: Menunggu.','Sudah Dibaca','2026-09-02 10:59:10'),(6,7,'Pembayaran baru untuk peminjaman #17. Status pembayaran: Belum Bayar.','Sudah Dibaca','2026-09-02 10:59:11'),(7,7,'Pengajuan peminjaman baru #18 dari user ID 5. Tanggal pinjam: 9999-09-09. Tanggal kembali: 9999-10-10. Status: Menunggu.','Sudah Dibaca','2026-09-02 11:27:14'),(8,7,'Pembayaran baru untuk peminjaman #18. Status pembayaran: Belum Bayar.','Sudah Dibaca','2026-09-02 11:27:15'),(9,7,'Pengajuan peminjaman baru #19 dari user ID 5. Tanggal pinjam: 2333-09-03. Tanggal kembali: 2333-09-11. Status: Menunggu.','Belum Dibaca','2026-09-03 15:13:43'),(10,7,'Pembayaran baru untuk peminjaman #19. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-03 15:13:54'),(11,5,'Peminjaman #19 telah diperbarui menjadi \"Disetujui\".','Belum Dibaca','2026-09-03 15:25:11'),(12,7,'Status peminjaman #19 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Disetujui\".','Belum Dibaca','2026-09-03 15:25:11'),(13,5,'Peminjaman #17 telah diperbarui menjadi \"Ditolak\".','Belum Dibaca','2026-09-03 15:26:13'),(14,7,'Status peminjaman #17 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Ditolak\".','Belum Dibaca','2026-09-03 15:26:13'),(15,5,'Peminjaman #18 telah diperbarui menjadi \"Ditolak\".','Belum Dibaca','2026-09-03 15:26:22'),(16,7,'Status peminjaman #18 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Ditolak\".','Belum Dibaca','2026-09-03 15:26:23'),(17,5,'Peminjaman #19 telah diperbarui menjadi \"Diproses\".','Sudah Dibaca','2026-09-04 13:18:09'),(18,7,'Status peminjaman #19 milik user ID 5 diubah dari \"Disetujui\" menjadi \"Diproses\".','Belum Dibaca','2026-09-04 13:18:09'),(19,5,'Peminjaman #16 telah diperbarui menjadi \"Ditolak\".','Belum Dibaca','2026-09-04 13:18:25'),(20,7,'Status peminjaman #16 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Ditolak\".','Belum Dibaca','2026-09-04 13:18:25'),(21,7,'Pengajuan peminjaman baru #20 dari user ID 9. Tanggal pinjam: 2026-09-09. Tanggal kembali: 2026-11-01. Status: Menunggu.','Belum Dibaca','2026-09-04 13:51:22'),(22,7,'Pembayaran baru untuk peminjaman #20. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-04 13:51:23'),(23,7,'Pengajuan peminjaman baru #21 dari user ID 5. Tanggal pinjam: 2222-03-31. Tanggal kembali: 2222-04-01. Status: Menunggu.','Belum Dibaca','2026-09-07 16:42:45'),(24,7,'Pembayaran baru untuk peminjaman #21. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-07 16:42:47'),(25,5,'Peminjaman #21 telah diperbarui menjadi \"Disetujui\".','Belum Dibaca','2026-09-07 16:57:01'),(26,7,'Status peminjaman #21 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Disetujui\".','Belum Dibaca','2026-09-07 16:57:01'),(27,9,'Peminjaman #20 telah diperbarui menjadi \"Disetujui\".','Belum Dibaca','2026-09-07 18:23:40'),(28,7,'Status peminjaman #20 milik user ID 9 diubah dari \"Menunggu\" menjadi \"Disetujui\".','Belum Dibaca','2026-09-07 18:23:41'),(29,5,'Peminjaman #14 telah diperbarui menjadi \"Ditolak\".','Belum Dibaca','2026-09-07 18:24:26'),(30,7,'Status peminjaman #14 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Ditolak\".','Belum Dibaca','2026-09-07 18:24:26'),(31,7,'Pengajuan peminjaman baru #22 dari user ID 5. Tanggal pinjam: 2222-10-10. Tanggal kembali: 2222-11-11. Status: Menunggu.','Belum Dibaca','2026-09-10 08:15:00'),(32,7,'Pembayaran baru untuk peminjaman #22. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-10 08:15:03'),(33,7,'Pengajuan peminjaman baru #23 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-31. Status: Menunggu.','Belum Dibaca','2026-09-10 15:11:18'),(34,7,'Pembayaran baru untuk peminjaman #23. Status pembayaran: Lunas.','Belum Dibaca','2026-09-10 15:11:40'),(35,5,'Pembayaran peminjaman #23 telah tercatat sebagai Lunas.','Belum Dibaca','2026-09-10 15:11:40'),(36,5,'Peminjaman #23 telah diperbarui menjadi \"Disetujui\".','Belum Dibaca','2026-09-10 15:14:37'),(37,7,'Status peminjaman #23 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Disetujui\".','Belum Dibaca','2026-09-10 15:14:37'),(38,7,'Pengajuan peminjaman baru #24 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-31. Status: Menunggu.','Belum Dibaca','2026-09-12 13:19:13'),(39,7,'Pengajuan peminjaman baru #25 dari user ID 9. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-31. Status: Menunggu.','Belum Dibaca','2026-09-12 13:19:13'),(40,7,'Pembayaran baru untuk peminjaman #25. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-12 13:19:16'),(41,7,'Pembayaran baru untuk peminjaman #24. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-12 13:19:16'),(42,7,'Pengajuan peminjaman baru #26 dari user ID 5. Tanggal pinjam: 2026-09-13. Tanggal kembali: 2026-09-14. Status: Menunggu.','Belum Dibaca','2026-09-12 13:34:55'),(43,7,'Pengajuan peminjaman baru #27 dari user ID 9. Tanggal pinjam: 2026-09-13. Tanggal kembali: 2026-09-14. Status: Menunggu.','Belum Dibaca','2026-09-12 13:34:56'),(44,7,'Pembayaran baru untuk peminjaman #26. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-12 13:34:56'),(45,7,'Pengajuan peminjaman baru #28 dari user ID 5. Tanggal pinjam: 2026-09-17. Tanggal kembali: 2026-10-17. Status: Menunggu.','Belum Dibaca','2026-09-16 13:27:25'),(46,7,'Pembayaran baru untuk peminjaman #28. Status pembayaran: Belum Bayar.','Belum Dibaca','2026-09-16 13:27:28'),(47,5,'Peminjaman #28 telah diperbarui menjadi \"Disetujui\".','Belum Dibaca','2026-09-16 13:28:27'),(48,7,'Status peminjaman #28 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Disetujui\".','Belum Dibaca','2026-09-16 13:28:27'),(49,5,'Peminjaman #28 telah diperbarui menjadi \"Diproses\".','Belum Dibaca','2026-09-16 13:35:21'),(50,7,'Status peminjaman #28 milik user ID 5 diubah dari \"Disetujui\" menjadi \"Diproses\".','Belum Dibaca','2026-09-16 13:35:21'),(51,9,'Status pembayaran untuk peminjaman #20 telah diubah menjadi \"Lunas\".','Belum Dibaca','2026-09-16 22:17:21'),(52,9,'Peminjaman #20 telah diperbarui menjadi \"Diproses\".','Belum Dibaca','2026-09-16 22:26:58'),(53,7,'Status peminjaman #20 milik user ID 9 diubah dari \"Disetujui\" menjadi \"Diproses\".','Belum Dibaca','2026-09-16 22:26:58'),(54,5,'Data pengembalian untuk peminjaman #28 telah diperbarui. Kondisi: Rusak Berat.','Belum Dibaca','2026-09-17 09:46:44'),(55,7,'Pengajuan peminjaman baru #29 dari user ID 5. Tanggal pinjam: 2222-11-11. Tanggal kembali: 2222-12-11. Status: Menunggu.','Belum Dibaca','2026-09-17 10:37:36'),(56,7,'Pengajuan peminjaman baru #30 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-02-23. Status: Menunggu.','Belum Dibaca','2026-09-17 10:52:58'),(57,7,'Pengajuan peminjaman baru #31 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-22. Status: Menunggu.','Belum Dibaca','2026-09-17 11:05:05'),(58,7,'Pengajuan peminjaman baru #32 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-22. Status: Menunggu.','Belum Dibaca','2026-09-17 11:05:48'),(59,7,'Pengajuan peminjaman baru #33 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-31. Status: Menunggu.','Belum Dibaca','2026-09-17 11:21:04'),(60,5,'Peminjaman #33 telah diperbarui menjadi \"Ditolak\".','Belum Dibaca','2026-09-17 11:30:40'),(61,7,'Status peminjaman #33 milik user ID 5 diubah dari \"Menunggu\" menjadi \"Ditolak\".','Belum Dibaca','2026-09-17 11:30:40'),(62,7,'Pengajuan peminjaman baru #34 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-03-31. Status: Menunggu.','Belum Dibaca','2026-09-17 11:31:49'),(63,7,'Pembayaran baru untuk peminjaman #34. DP 50% sebesar Rp2.775.000. Menunggu verifikasi petugas.','Belum Dibaca','2026-09-17 11:31:56'),(64,5,'Pembayaran untuk peminjaman #34 sebesar Rp2.775.000 berhasil dikirim dan sedang menunggu verifikasi petugas.','Belum Dibaca','2026-09-17 11:31:56'),(65,7,'Pengajuan peminjaman baru #35 dari user ID 5. Tanggal pinjam: 2222-02-22. Tanggal kembali: 2222-02-23. Status: Menunggu.','Belum Dibaca','2026-09-17 12:13:36'),(66,7,'Pembayaran baru untuk peminjaman #35. DP 50% sebesar Rp85.000. Menunggu verifikasi petugas.','Belum Dibaca','2026-09-17 12:13:39'),(67,5,'Pembayaran untuk peminjaman #35 sebesar Rp85.000 berhasil dikirim dan sedang menunggu verifikasi petugas.','Belum Dibaca','2026-09-17 12:13:39');
/*!40000 ALTER TABLE `notifikasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pelayanan`
--

DROP TABLE IF EXISTS `pelayanan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pelayanan` (
  `id_pelayanan` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `id_petugas` int(11) NOT NULL,
  `tanggal_pelayanan` date NOT NULL,
  `jenis_pelayanan` enum('Pengambilan','Pengembalian','Perawatan','Konsultasi') DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  PRIMARY KEY (`id_pelayanan`),
  KEY `fk_pelayanan_user` (`id_user`),
  KEY `fk_pelayanan_petugas` (`id_petugas`),
  CONSTRAINT `fk_pelayanan_petugas` FOREIGN KEY (`id_petugas`) REFERENCES `petugas` (`id_petugas`),
  CONSTRAINT `fk_pelayanan_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pelayanan`
--

LOCK TABLES `pelayanan` WRITE;
/*!40000 ALTER TABLE `pelayanan` DISABLE KEYS */;
/*!40000 ALTER TABLE `pelayanan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pembayaran`
--

DROP TABLE IF EXISTS `pembayaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pembayaran` (
  `id_pembayaran` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjaman` int(11) NOT NULL,
  `tanggal_bayar` datetime DEFAULT current_timestamp(),
  `total` decimal(12,2) NOT NULL,
  `metode` enum('Cash','Transfer Bank','QRIS') NOT NULL,
  `status` enum('Belum Bayar','Lunas') NOT NULL DEFAULT 'Belum Bayar',
  `bukti_bayar` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_pembayaran`),
  UNIQUE KEY `uq_pembayaran_peminjaman` (`id_peminjaman`),
  CONSTRAINT `fk_bayar_pinjam` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pembayaran`
--

LOCK TABLES `pembayaran` WRITE;
/*!40000 ALTER TABLE `pembayaran` DISABLE KEYS */;
INSERT INTO `pembayaran` VALUES (1,6,NULL,61650000.00,'Cash','Belum Bayar','nth'),(2,16,'2026-09-02 03:55:55',4725000.00,'QRIS','Belum Bayar',NULL),(3,17,'2026-09-02 03:59:09',5512500.00,'QRIS','Belum Bayar',NULL),(4,18,'2026-09-02 04:27:13',2480000.00,'Cash','Belum Bayar',NULL),(5,19,'2026-09-03 08:13:43',800000.00,'QRIS','Belum Bayar','/uploads/pembayaran/1788423225055-baju-tari-badestar.jpeg'),(6,20,'2026-09-04 06:51:20',3180000.00,'QRIS','Lunas','/uploads/pembayaran/1788504682977-dress-awards-hijab.jpeg'),(7,21,'2026-09-07 09:42:40',80000.00,'QRIS','Belum Bayar','/uploads/pembayaran/1788774166754-baju-tari-badestar.jpeg'),(8,22,'2026-09-10 01:14:48',2800000.00,'QRIS','Belum Bayar','/uploads/pembayaran/1789002901362-screenshot-637.png'),(9,23,'2026-09-10 08:11:13',5550000.00,'QRIS','Lunas','/uploads/pembayaran/1789027883356-screenshot-773.png'),(10,25,'2026-09-12 06:19:03',3700000.00,'','Belum Bayar','/uploads/pembayaran/1789193954786-screenshot-78.png'),(11,24,'2026-09-12 06:19:03',3700000.00,'QRIS','Belum Bayar','/uploads/pembayaran/1789193954645-screenshot-74.png'),(12,26,'2026-09-12 06:34:45',100000.00,'QRIS','Belum Bayar','/uploads/pembayaran/1789194895930-screenshot-74.png'),(13,28,'2026-09-16 06:27:26',2550000.00,'QRIS','Belum Bayar','/uploads/pembayaran/1789540047001-screenshot-78.png'),(14,34,'2026-09-17 04:31:49',2775000.00,'QRIS','Belum Bayar','1789619510816-741041990-Screenshot__79_.png'),(15,35,'2026-09-17 05:13:36',85000.00,'QRIS','Belum Bayar','1789622017833-487512971-Screenshot__78_.png');
/*!40000 ALTER TABLE `pembayaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pembayaran_denda`
--

DROP TABLE IF EXISTS `pembayaran_denda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pembayaran_denda` (
  `id_pembayaran_denda` int(11) NOT NULL AUTO_INCREMENT,
  `id_denda` int(11) NOT NULL,
  `tanggal_bayar` datetime DEFAULT NULL,
  `jumlah` decimal(12,2) NOT NULL DEFAULT 0.00,
  `metode` enum('Cash','Transfer','QRIS') DEFAULT NULL,
  `bukti_bayar` varchar(255) DEFAULT NULL,
  `status` enum('Belum Bayar','Menunggu Verifikasi','Lunas','Ditolak') NOT NULL DEFAULT 'Belum Bayar',
  `diverifikasi_oleh` int(11) DEFAULT NULL,
  `tanggal_verifikasi` datetime DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pembayaran_denda`),
  KEY `idx_pembayaran_denda_denda` (`id_denda`),
  KEY `idx_pembayaran_denda_petugas` (`diverifikasi_oleh`),
  CONSTRAINT `fk_pembayaran_denda_denda` FOREIGN KEY (`id_denda`) REFERENCES `denda` (`id_denda`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pembayaran_denda_petugas` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `petugas` (`id_petugas`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pembayaran_denda`
--

LOCK TABLES `pembayaran_denda` WRITE;
/*!40000 ALTER TABLE `pembayaran_denda` DISABLE KEYS */;
/*!40000 ALTER TABLE `pembayaran_denda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `peminjaman`
--

DROP TABLE IF EXISTS `peminjaman`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `peminjaman` (
  `id_peminjaman` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `disetujui_oleh` int(11) DEFAULT NULL,
  `diproses_oleh` int(11) DEFAULT NULL,
  `tanggal_peminjaman` date NOT NULL,
  `tanggal_kembali` date NOT NULL,
  `total_harga` decimal(12,2) DEFAULT 0.00,
  `status` enum('Menunggu','Disetujui','Diproses','Selesai','Ditolak','Dibatalkan') NOT NULL DEFAULT 'Menunggu',
  PRIMARY KEY (`id_peminjaman`),
  KEY `fk_pinjam_user` (`id_user`),
  KEY `fk_pinjam_admin` (`disetujui_oleh`),
  KEY `fk_pinjam_petugas` (`diproses_oleh`),
  CONSTRAINT `fk_pinjam_admin` FOREIGN KEY (`disetujui_oleh`) REFERENCES `admin` (`id_admin`),
  CONSTRAINT `fk_pinjam_petugas` FOREIGN KEY (`diproses_oleh`) REFERENCES `petugas` (`id_petugas`),
  CONSTRAINT `fk_pinjam_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `peminjaman`
--

LOCK TABLES `peminjaman` WRITE;
/*!40000 ALTER TABLE `peminjaman` DISABLE KEYS */;
INSERT INTO `peminjaman` VALUES (1,5,NULL,NULL,'8888-09-09','9999-09-09',9999999999.99,'Disetujui'),(2,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Ditolak'),(3,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Disetujui'),(4,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Disetujui'),(5,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Selesai'),(6,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Selesai'),(7,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Disetujui'),(8,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Ditolak'),(9,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Ditolak'),(10,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Diproses'),(11,5,NULL,NULL,'2026-08-17','2027-01-01',61650000.00,'Ditolak'),(12,5,NULL,NULL,'2026-08-19','2026-09-09',5775000.00,'Selesai'),(13,5,NULL,NULL,'2026-08-19','2026-10-10',18200000.00,'Selesai'),(14,5,NULL,NULL,'2026-09-09','2026-10-10',13950000.00,'Ditolak'),(15,5,NULL,NULL,'2026-09-09','2026-10-10',5425000.00,'Disetujui'),(16,5,NULL,NULL,'2026-09-09','2026-11-11',9450000.00,'Ditolak'),(17,5,NULL,NULL,'2026-09-09','2026-11-11',11025000.00,'Ditolak'),(18,5,NULL,NULL,'9999-09-09','9999-10-10',4960000.00,'Ditolak'),(19,5,NULL,NULL,'2333-09-03','2333-09-11',1600000.00,'Diproses'),(20,9,NULL,NULL,'2026-09-09','2026-11-01',6360000.00,'Selesai'),(21,5,NULL,NULL,'2222-03-31','2222-04-01',160000.00,'Disetujui'),(22,5,NULL,NULL,'2222-10-10','2222-11-11',5600000.00,'Menunggu'),(23,5,NULL,NULL,'2222-02-22','2222-03-31',5550000.00,'Disetujui'),(24,5,NULL,NULL,'2222-02-22','2222-03-31',7400000.00,'Menunggu'),(25,9,NULL,NULL,'2222-02-22','2222-03-31',7400000.00,'Menunggu'),(26,5,NULL,NULL,'2026-09-13','2026-09-14',200000.00,'Menunggu'),(27,9,NULL,NULL,'2026-09-13','2026-09-14',200000.00,'Menunggu'),(28,5,NULL,NULL,'2026-09-17','2026-10-17',5100000.00,'Selesai'),(29,5,NULL,NULL,'2222-11-11','2222-12-11',4500000.00,'Menunggu'),(30,5,NULL,NULL,'2222-02-22','2222-02-23',150000.00,'Menunggu'),(31,5,NULL,NULL,'2222-02-22','2222-03-22',5600000.00,'Menunggu'),(32,5,NULL,NULL,'2222-02-22','2222-03-22',5600000.00,'Menunggu'),(33,5,NULL,NULL,'2222-02-22','2222-03-31',5550000.00,'Ditolak'),(34,5,NULL,NULL,'2222-02-22','2222-03-31',5550000.00,'Menunggu'),(35,5,NULL,NULL,'2222-02-22','2222-02-23',170000.00,'Menunggu');
/*!40000 ALTER TABLE `peminjaman` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengaturan_pembayaran`
--

DROP TABLE IF EXISTS `pengaturan_pembayaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pengaturan_pembayaran` (
  `id_pengaturan` int(11) NOT NULL AUTO_INCREMENT,
  `metode` varchar(50) NOT NULL,
  `nama_penerima` varchar(100) DEFAULT NULL,
  `nomor_rekening` varchar(100) DEFAULT NULL,
  `nama_bank` varchar(100) DEFAULT NULL,
  `qris` varchar(255) DEFAULT NULL,
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pengaturan`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengaturan_pembayaran`
--

LOCK TABLES `pengaturan_pembayaran` WRITE;
/*!40000 ALTER TABLE `pengaturan_pembayaran` DISABLE KEYS */;
INSERT INTO `pengaturan_pembayaran` VALUES (1,'QRIS','Handu Atelier','651742321','BCA','/uploads/pembayaran/qris-qris-1788333138827.png','Aktif','2026-09-02 05:14:59','2026-09-02 07:40:56');
/*!40000 ALTER TABLE `pengaturan_pembayaran` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengembalian`
--

DROP TABLE IF EXISTS `pengembalian`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pengembalian` (
  `id_pengembalian` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjaman` int(11) NOT NULL,
  `tanggal_pengembalian` date NOT NULL,
  `kondisi_baju` enum('Baik','Kotor','Rusak Ringan','Rusak Berat','Hilang') DEFAULT NULL,
  `denda` decimal(12,2) DEFAULT 0.00,
  `keterangan` text DEFAULT NULL,
  `diterima_oleh` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_pengembalian`),
  KEY `fk_kembali_pinjam` (`id_peminjaman`),
  KEY `fk_kembali_petugas` (`diterima_oleh`),
  CONSTRAINT `fk_kembali_petugas` FOREIGN KEY (`diterima_oleh`) REFERENCES `petugas` (`id_petugas`),
  CONSTRAINT `fk_kembali_pinjam` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengembalian`
--

LOCK TABLES `pengembalian` WRITE;
/*!40000 ALTER TABLE `pengembalian` DISABLE KEYS */;
INSERT INTO `pengembalian` VALUES (1,5,'2027-01-01','Baik',200.00,'lu rusakin yh',1),(2,12,'2026-08-20','Kotor',100000.00,'cuci cok gmn si luwh',1),(3,13,'2026-08-20','Rusak Ringan',70000.00,NULL,1),(4,10,'2026-09-03','Rusak Berat',0.00,NULL,1),(5,20,'2026-09-16','Baik',0.00,'Pengembalian dalam kondisi baik',1),(6,28,'2026-10-17','Rusak Berat',300000.00,'rusak pwoll',1);
/*!40000 ALTER TABLE `pengembalian` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pengembalian_dana`
--

DROP TABLE IF EXISTS `pengembalian_dana`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pengembalian_dana` (
  `id_pengembalian_dana` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjaman` int(11) NOT NULL,
  `id_pembayaran` int(11) NOT NULL,
  `jumlah_dana` decimal(12,2) NOT NULL DEFAULT 0.00,
  `alasan` text DEFAULT NULL,
  `metode_pengembalian` enum('Transfer Bank','QRIS','Cash') NOT NULL DEFAULT 'Transfer Bank',
  `status` enum('Menunggu Pengembalian','Diproses','Berhasil','Gagal') NOT NULL DEFAULT 'Menunggu Pengembalian',
  `tanggal_pengajuan` datetime NOT NULL DEFAULT current_timestamp(),
  `tanggal_pengembalian` datetime DEFAULT NULL,
  `bukti_pengembalian` varchar(255) DEFAULT NULL,
  `diproses_oleh` int(11) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pengembalian_dana`),
  KEY `idx_pengembalian_dana_peminjaman` (`id_peminjaman`),
  KEY `idx_pengembalian_dana_pembayaran` (`id_pembayaran`),
  KEY `idx_pengembalian_dana_status` (`status`),
  KEY `idx_pengembalian_dana_diproses_oleh` (`diproses_oleh`),
  CONSTRAINT `fk_pengembalian_dana_pembayaran` FOREIGN KEY (`id_pembayaran`) REFERENCES `pembayaran` (`id_pembayaran`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pengembalian_dana_peminjaman` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id_peminjaman`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pengembalian_dana_petugas` FOREIGN KEY (`diproses_oleh`) REFERENCES `petugas` (`id_petugas`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pengembalian_dana`
--

LOCK TABLES `pengembalian_dana` WRITE;
/*!40000 ALTER TABLE `pengembalian_dana` DISABLE KEYS */;
/*!40000 ALTER TABLE `pengembalian_dana` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `percakapan`
--

DROP TABLE IF EXISTS `percakapan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `percakapan` (
  `id_percakapan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pelanggan` int(11) NOT NULL,
  `id_petugas` int(11) DEFAULT NULL,
  `status` enum('Aktif','Selesai') NOT NULL DEFAULT 'Aktif',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_percakapan`),
  KEY `idx_pelanggan` (`id_pelanggan`),
  KEY `idx_petugas` (`id_petugas`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `percakapan`
--

LOCK TABLES `percakapan` WRITE;
/*!40000 ALTER TABLE `percakapan` DISABLE KEYS */;
INSERT INTO `percakapan` VALUES (1,5,NULL,'Aktif','2026-09-10 09:27:21','2026-09-10 15:15:21'),(2,9,NULL,'Aktif','2026-09-10 09:57:29','2026-09-10 09:57:32');
/*!40000 ALTER TABLE `percakapan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pesan_chat`
--

DROP TABLE IF EXISTS `pesan_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pesan_chat` (
  `id_pesan` int(11) NOT NULL AUTO_INCREMENT,
  `id_percakapan` int(11) NOT NULL,
  `id_pengirim` int(11) NOT NULL,
  `pesan` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'Terkirim',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_pesan`),
  KEY `idx_pesan_chat_percakapan` (`id_percakapan`),
  KEY `idx_pesan_chat_pengirim` (`id_pengirim`),
  KEY `idx_pesan_chat_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pesan_chat`
--

LOCK TABLES `pesan_chat` WRITE;
/*!40000 ALTER TABLE `pesan_chat` DISABLE KEYS */;
INSERT INTO `pesan_chat` VALUES (1,1,5,'assalamualaikum','Dibaca','2026-09-10 09:56:07'),(2,1,6,'waalaikumsalam','Terkirim','2026-09-10 09:56:31'),(3,2,9,'woi','Dibaca','2026-09-10 09:57:32'),(4,1,5,'hy','Dibaca','2026-09-10 15:12:17'),(5,1,6,'iy','Terkirim','2026-09-10 15:15:21');
/*!40000 ALTER TABLE `pesan_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `petugas`
--

DROP TABLE IF EXISTS `petugas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `petugas` (
  `id_petugas` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `no_whatsapp` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_petugas`),
  UNIQUE KEY `id_user` (`id_user`),
  CONSTRAINT `fk_petugas_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `petugas`
--

LOCK TABLES `petugas` WRITE;
/*!40000 ALTER TABLE `petugas` DISABLE KEYS */;
INSERT INTO `petugas` VALUES (1,6,'Petugas Atelier','081298765432'),(4,NULL,'Apis SIgma','12345678999');
/*!40000 ALTER TABLE `petugas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refund`
--

DROP TABLE IF EXISTS `refund`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refund` (
  `id_refund` int(11) NOT NULL AUTO_INCREMENT,
  `id_pembayaran` int(11) NOT NULL,
  `jumlah_refund` decimal(12,2) NOT NULL DEFAULT 0.00,
  `alasan` text DEFAULT NULL,
  `status` enum('Menunggu Refund','Diproses','Berhasil','Gagal') NOT NULL DEFAULT 'Menunggu Refund',
  `tanggal_pengajuan` datetime NOT NULL DEFAULT current_timestamp(),
  `tanggal_refund` datetime DEFAULT NULL,
  `diproses_oleh` int(11) DEFAULT NULL,
  `bukti_refund` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_refund`),
  KEY `idx_refund_pembayaran` (`id_pembayaran`),
  KEY `idx_refund_petugas` (`diproses_oleh`),
  CONSTRAINT `fk_refund_pembayaran` FOREIGN KEY (`id_pembayaran`) REFERENCES `pembayaran` (`id_pembayaran`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_refund_petugas` FOREIGN KEY (`diproses_oleh`) REFERENCES `petugas` (`id_petugas`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund`
--

LOCK TABLES `refund` WRITE;
/*!40000 ALTER TABLE `refund` DISABLE KEYS */;
/*!40000 ALTER TABLE `refund` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrasi`
--

DROP TABLE IF EXISTS `registrasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registrasi` (
  `id_registrasi` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `tanggal_registrasi` datetime DEFAULT current_timestamp(),
  `status` enum('Menunggu','Disetujui','Ditolak') DEFAULT 'Menunggu',
  PRIMARY KEY (`id_registrasi`),
  KEY `fk_registrasi_user` (`id_user`),
  KEY `fk_registrasi_admin` (`id_admin`),
  CONSTRAINT `fk_registrasi_admin` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id_admin`),
  CONSTRAINT `fk_registrasi_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrasi`
--

LOCK TABLES `registrasi` WRITE;
/*!40000 ALTER TABLE `registrasi` DISABLE KEYS */;
INSERT INTO `registrasi` VALUES (1,1,1,'2026-07-30 08:34:26','Disetujui');
/*!40000 ALTER TABLE `registrasi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id_role` int(11) NOT NULL AUTO_INCREMENT,
  `nama_role` varchar(100) NOT NULL,
  PRIMARY KEY (`id_role`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin'),(2,'Petugas'),(3,'User');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `id_role` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`id_role`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id_role`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Farhan','farhan@gmail.com','123456','081234567890','Payakumbuh',3,'2026-08-13 19:22:37','2026-08-13 19:22:37',NULL),(5,'ndu kyut','rahmadani092008@gmail.com','$2b$10$30ZGgOs8Vk6wTqlzl08UIuLAor/jfkLDD8Bj6rFaDJX2AIpgSUHHW','082170106264','swiss',3,'2026-08-14 09:08:01','2026-08-29 23:16:36',NULL),(6,'Petugas Atelier','petugas@handuatelier.com','$2b$10$8QI9kmbFGMM5Kn3eoL67tu57YHR9XHANerfF4xjhcEl5l8lRd.4o2','081298765432','Handu Atelier pyk',2,'2026-08-17 13:27:20','2026-08-26 08:32:48',NULL),(7,'Handu Atelier','handuadmin123@gmail.com','$2b$10$O0u0wNwJ1IqMa44iMKmbi.a1kxQ3I0Sv8IG/LSL4QYbq6KJbe7X8O','083146721382','Jalan Koto Panjang Dalam No.1',1,'2026-08-26 08:47:42','2026-08-27 22:48:06',NULL),(9,'FARHAN SOFIANTO','farhansofianto02@gmail.com','$2b$10$qqjXVbLkx.6hHrYefCTgoeVKLBareLXm.nkQDUIbmXQuJyjgEQ9LS','080909892192','jln palam rt 01',3,'2026-09-04 13:49:42','2026-09-04 13:49:42',NULL),(10,'jamet','jamet123@gmail.com','$2b$10$gQkEGk1OJqKKEFnRC9G.rOyCVWQFe0Ses4d.tw5QTdN2lLwBru1PO','0812345678','bukitpendek',3,'2026-09-04 14:44:58','2026-09-04 14:44:58',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-18 11:08:10
