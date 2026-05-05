-- ==============================================================================
-- Schema: digital-asset-vault
-- Focus: Streaming Ingestion, Checksum Integrity, and Multi-Tenant Isolation
-- Author: Kuncham Venkata Satya Manikanta
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients / Tenants
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(150) NOT NULL,
    country_code VARCHAR(10) NOT NULL DEFAULT 'US',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Asset Registry
CREATE TABLE IF NOT EXISTS digital_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_checksum CHAR(64) NOT NULL,
    total_chunks INT NOT NULL DEFAULT 1,
    uploaded_chunks INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('PENDING', 'UPLOADING', 'PROCESSING', 'READY', 'FAILED'))
);

-- Chunk Tracking Ledger for Resumable Uploads
CREATE TABLE IF NOT EXISTS asset_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_size_bytes INT NOT NULL,
    chunk_sha256 CHAR(64) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_asset_chunk UNIQUE (asset_id, chunk_index)
);

-- Audit Trail for Enterprise Export Tracking
CREATE TABLE IF NOT EXISTS asset_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Composite Indexes for Sub-50ms Querying
CREATE INDEX IF NOT EXISTS idx_assets_client_status ON digital_assets(client_id, status);
CREATE INDEX IF NOT EXISTS idx_assets_checksum ON digital_assets(sha256_checksum);
CREATE INDEX IF NOT EXISTS idx_chunks_asset_index ON asset_chunks(asset_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_audit_asset_created ON asset_audit_logs(asset_id, created_at DESC);
