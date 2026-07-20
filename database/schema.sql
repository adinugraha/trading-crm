# Database Schema - Trading CRM
# MySQL 8.0+

CREATE DATABASE IF NOT EXISTS trading_crm;
USE trading_crm;

-- Companies Table
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    established_year INT,
    annual_revenue BIGINT COMMENT 'In IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients Table
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    annual_revenue BIGINT COMMENT 'In IDR',
    employee_count INT,
    potential_value BIGINT COMMENT 'In IDR - Estimated potential',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contacts Table
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    department VARCHAR(100),
    notes TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    FULLTEXT INDEX ft_name (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deal Stages Reference
CREATE TABLE deal_stages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    sequence INT NOT NULL UNIQUE,
    color VARCHAR(7),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deals Table
CREATE TABLE deals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value BIGINT NOT NULL COMMENT 'In IDR',
    stage_id INT NOT NULL,
    probability_percent INT DEFAULT 0,
    expected_close_date DATE,
    actual_close_date DATE,
    won_lost_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (stage_id) REFERENCES deal_stages(id),
    INDEX idx_company (company_id),
    INDEX idx_client (client_id),
    INDEX idx_stage (stage_id),
    INDEX idx_close_date (expected_close_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Types Reference
CREATE TABLE activity_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50),
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activities Table
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    deal_id INT,
    client_id INT,
    contact_id INT,
    type_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date DATETIME,
    duration_minutes INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    FOREIGN KEY (type_id) REFERENCES activity_types(id),
    INDEX idx_deal (deal_id),
    INDEX idx_client (client_id),
    INDEX idx_activity_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Deal History (Audit Trail)
CREATE TABLE deal_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    deal_id INT NOT NULL,
    old_stage_id INT,
    new_stage_id INT NOT NULL,
    old_value BIGINT,
    new_value BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (old_stage_id) REFERENCES deal_stages(id),
    FOREIGN KEY (new_stage_id) REFERENCES deal_stages(id),
    INDEX idx_deal (deal_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Indexes for performance
CREATE INDEX idx_deals_value ON deals(value);
CREATE INDEX idx_deals_created ON deals(created_at);
CREATE INDEX idx_activities_created ON activities(created_at);

-- Insert Deal Stages
INSERT INTO deal_stages (name, sequence, color, description) VALUES
('Prospecting', 1, '#EF4444', 'Initial prospect identified'),
('Qualification', 2, '#F59E0B', 'Prospect qualified'),
('Proposal', 3, '#FBBF24', 'Proposal sent'),
('Negotiation', 4, '#84CC16', 'In negotiation'),
('Closing', 5, '#003F7F', 'Final stage before close'),
('Won', 6, '#10B981', 'Deal won'),
('Lost', 7, '#6B7280', 'Deal lost');

-- Insert Activity Types
INSERT INTO activity_types (name, icon, description) VALUES
('Meeting', '📞', 'Face to face or call meeting'),
('Email', '📧', 'Email communication'),
('Proposal', '📄', 'Proposal sent'),
('Note', '📝', 'Internal note'),
('Task', '✅', 'Task/To-do'),
('Follow-up', '🔔', 'Follow-up call or message');
