-- ===========================================
-- STS Database Initialization
-- ===========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create application user if not exists (for production)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sts_app') THEN
--         CREATE ROLE sts_app WITH LOGIN PASSWORD 'sts_app_password';
--     END IF;
-- END
-- $$;

-- Grant permissions
-- GRANT ALL PRIVILEGES ON DATABASE sts TO sts_app;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'STS Database initialized successfully';
END
$$;
