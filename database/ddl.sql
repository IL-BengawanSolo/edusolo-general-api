-- 1. Tabel-tabel Lookup Utama
CREATE TABLE
  `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `uuid` CHAR(36) UNIQUE NOT NULL,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100),
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(16) NULL,
    `dob` DATE NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_login_at` DATETIME NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE
  `regions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE
  );

CREATE TABLE
  `place_types` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE
  );

CREATE TABLE
  `categories` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE
  );

CREATE TABLE
  `age_categories` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE
  );

CREATE TABLE
  `questions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `question_text` TEXT NOT NULL,
    `answer_choices` JSON,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

CREATE TABLE
  activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
  );

CREATE TABLE
  facilities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
  );

-- 2. Tabel Inti 'tourist_places'
CREATE TABLE
  `tourist_places` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `uuid` CHAR(36) UNIQUE NOT NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `name` TEXT NOT NULL,
    `address` TEXT,
    `region_id` INT,
    `latitude` FLOAT NULL,
    `longitude` FLOAT NULL,
    `description` TEXT,
    `ticket_price_info` JSON NULL,
    `ticket_price_min` DECIMAL(15, 2),
    `ticket_price_max` DECIMAL(15, 2),
    `review_count` INT DEFAULT 0,
    `average_rating` FLOAT DEFAULT 0,
    `website_url` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL
  );

-- 3. Tabel Anak dan Tabel Junction (Many-to-Many)
CREATE TABLE
  `opening_hours` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `place_id` INT NOT NULL,
    `day_of_week` INT NOT NULL COMMENT '1=Senin, 7=Minggu',
    `open_time` TIME NULL,
    `close_time` TIME NULL,
    `is_closed` BOOLEAN NOT NULL,
    FOREIGN KEY (`place_id`) REFERENCES `tourist_places` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  `place_images` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `place_id` INT NOT NULL,
    `image_url` TEXT NOT NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`place_id`) REFERENCES `tourist_places` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  `tourist_place_types` (
    `place_id` INT NOT NULL,
    `place_type_id` INT NOT NULL,
    PRIMARY KEY (`place_id`, `place_type_id`),
    FOREIGN KEY (`place_id`) REFERENCES `tourist_places` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`place_type_id`) REFERENCES `place_types` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  `tourist_place_categories` (
    `place_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    PRIMARY KEY (`place_id`, `category_id`),
    FOREIGN KEY (`place_id`) REFERENCES `tourist_places` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  `tourist_place_age_categories` (
    `place_id` INT NOT NULL,
    `age_category_id` INT NOT NULL,
    PRIMARY KEY (`place_id`, `age_category_id`),
    FOREIGN KEY (`place_id`) REFERENCES `tourist_places` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`age_category_id`) REFERENCES `age_categories` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  tourist_place_activities (
    place_id INT NOT NULL,
    activity_id INT NOT NULL,
    PRIMARY KEY (place_id, activity_id),
    FOREIGN KEY (place_id) REFERENCES tourist_places (id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
  );

CREATE TABLE
  tourist_place_facilities (
    place_id INT NOT NULL,
    facility_id INT NOT NULL,
    PRIMARY KEY (place_id, facility_id),
    FOREIGN KEY (place_id) REFERENCES tourist_places (id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE CASCADE
  );

-- 4. Tabel untuk Fitur Rekomendasi dan Chatbot
CREATE TABLE
  `recommendation_sessions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  `user_answers` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `uuid` CHAR(36) UNIQUE NOT NULL,
    `session_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    `answer_value` JSON,
    FOREIGN KEY (`session_id`) REFERENCES `recommendation_sessions` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
  );

CREATE TABLE
  `recommendation_results` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `session_id` INT NOT NULL,
    `place_id` INT NOT NULL,
    `score` FLOAT,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`session_id`) REFERENCES `recommendation_sessions` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`place_id`) REFERENCES `tourist_places` (`id`) ON DELETE CASCADE
  );