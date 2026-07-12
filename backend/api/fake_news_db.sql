-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2026 at 06:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_ac78f8_fknews`
--

-- --------------------------------------------------------

--
-- Table structure for table `analysis_logs`
--

CREATE TABLE `analysis_logs` (
  `id` int(11) NOT NULL,
  `input_text` text DEFAULT NULL,
  `source_url` varchar(255) DEFAULT NULL,
  `result_status` varchar(50) DEFAULT NULL,
  `confidence_score` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `analysis_logs`
--

INSERT INTO `analysis_logs` (`id`, `input_text`, `source_url`, `result_status`, `confidence_score`, `created_at`) VALUES
(1, 'أكدت الصحافة الأمريكية، مساء اليوم الجمعة، أن الجيش الأمريكي تمكّن من العثور على أحد الطيارَين اللذين أسقطت إيران طائرتهما، وذلك في أعقاب الإعلان عن عملية أمريكية للبحث عنهما، في الوقت الذي عرضت فيه السلطات الإيرانية مكافأة لمن يدلي بمعلومات عن طاقم الطائرة.\n\nوأجمعت شبكة \"سي بي إس\" وموقع أكسيوس -نقلا عن مصادر مطلعة ومسؤولة- أن القوات الخاصة الأمريكية أنقذت أحد عنصري الطائرة التي أُسقطت في إيران، بينما يستمر البحث عن العنصر الثاني.', '', 'uncertain', 50, '2026-04-03 16:40:10');

-- --------------------------------------------------------

--
-- Table structure for table `suspicious_keywords`
--

CREATE TABLE `suspicious_keywords` (
  `id` int(11) NOT NULL,
  `keyword` varchar(255) NOT NULL,
  `weight` int(11) DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suspicious_keywords`
--

INSERT INTO `suspicious_keywords` (`id`, `keyword`, `weight`) VALUES
(1, 'عاجل', 15),
(2, 'صادم', 15),
(3, 'كارثة', 10),
(4, 'لن تصدق', 20),
(5, 'فضيحة', 20),
(6, 'تسريب', 15),
(7, 'شاهد قبل الحذف', 25),
(8, 'سري للغاية', 15);

-- --------------------------------------------------------

--
-- Table structure for table `trusted_sources`
--

CREATE TABLE `trusted_sources` (
  `id` int(11) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `source_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trusted_sources`
--

INSERT INTO `trusted_sources` (`id`, `domain`, `source_name`) VALUES
(1, 'bbc.com', 'BBC Arabic'),
(2, 'reuters.com', 'Reuters'),
(3, 'aljazeera.net', 'Al Jazeera'),
(4, 'skynewsarabia.com', 'Sky News Arabia'),
(5, 'alarabiya.net', 'Al Arabiya');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `analysis_logs`
--
ALTER TABLE `analysis_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `suspicious_keywords`
--
ALTER TABLE `suspicious_keywords`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trusted_sources`
--
ALTER TABLE `trusted_sources`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `analysis_logs`
--
ALTER TABLE `analysis_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `suspicious_keywords`
--
ALTER TABLE `suspicious_keywords`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `trusted_sources`
--
ALTER TABLE `trusted_sources`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL UNIQUE,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `status` varchar(20) DEFAULT 'active',
  `token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `status`) VALUES
(1, 'admin', 'admin@fakenews.com', '$2y$10$bhINntTLAMpEhNiNPHdV2OppbxFEFaB4dtv4aIJNpVC0GldEpIsrS', 'admin', 'active');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
