-- ============================================
-- DTF Order Management System - D1 Schema
-- ============================================

-- Tabla principal de pedidos
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    dtf_type TEXT NOT NULL CHECK (dtf_type IN ('textil', 'uv')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Archivos asociados a cada pedido
CREATE TABLE order_files (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,        -- Key en R2
    file_name TEXT NOT NULL,       -- Nombre original
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices para consultas comunes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_files_order_id ON order_files(order_id);
