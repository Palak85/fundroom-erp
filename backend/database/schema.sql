-- ============================================================
-- MINI ERP + CRM OPERATIONS PORTAL - POSTGRESQL / SUPABASE SCHEMA
-- ============================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Sales', 'Warehouse', 'Accounts')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    business_name VARCHAR(255),
    gst_number VARCHAR(50),
    customer_type VARCHAR(50) NOT NULL CHECK (customer_type IN ('Retail', 'Wholesale', 'Distributor')),
    address TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Lead' CHECK (status IN ('Lead', 'Active', 'Inactive')),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMER FOLLOWUPS TABLE
CREATE TABLE IF NOT EXISTS customer_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    notes TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    minimum_stock INT NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    warehouse_location VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    reason TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CHALLANS TABLE
CREATE TABLE IF NOT EXISTS challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total_quantity INT NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELLED')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHALLAN ITEMS TABLE (Snapshot of product information)
CREATE TABLE IF NOT EXISTS challan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_id UUID NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_follow_up_date ON customers(follow_up_date);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(current_stock, minimum_stock);

CREATE INDEX IF NOT EXISTS idx_challans_number ON challans(challan_number);
CREATE INDEX IF NOT EXISTS idx_challans_customer_id ON challans(customer_id);
CREATE INDEX IF NOT EXISTS idx_challans_status ON challans(status);
CREATE INDEX IF NOT EXISTS idx_challans_created_at ON challans(created_at);

CREATE INDEX IF NOT EXISTS idx_challan_items_challan_id ON challan_items(challan_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_followups_customer_id ON customer_followups(customer_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE challan_items ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service_role and authenticated queries
DO $$
BEGIN
    DROP POLICY IF EXISTS "Service role full access on users" ON users;
    CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on customers" ON customers;
    CREATE POLICY "Service role full access on customers" ON customers FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on customer_followups" ON customer_followups;
    CREATE POLICY "Service role full access on customer_followups" ON customer_followups FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on products" ON products;
    CREATE POLICY "Service role full access on products" ON products FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on stock_movements" ON stock_movements;
    CREATE POLICY "Service role full access on stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on challans" ON challans;
    CREATE POLICY "Service role full access on challans" ON challans FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access on challan_items" ON challan_items;
    CREATE POLICY "Service role full access on challan_items" ON challan_items FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ============================================================
-- POSTGRESQL ATOMIC FUNCTION FOR CHALLAN CONFIRMATION
-- ============================================================
CREATE OR REPLACE FUNCTION confirm_sales_challan(
    p_challan_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_challan RECORD;
    v_item RECORD;
    v_product RECORD;
BEGIN
    -- 1. Lock and fetch challan
    SELECT * INTO v_challan
    FROM challans
    WHERE id = p_challan_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Challan not found';
    END IF;

    IF v_challan.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Challan is already % and cannot be confirmed', v_challan.status;
    END IF;

    -- 2. Verify stock for all items
    FOR v_item IN
        SELECT ci.*, p.product_name AS current_pname, p.current_stock
        FROM challan_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.challan_id = p_challan_id
        FOR UPDATE OF p
    LOOP
        IF v_item.current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product "%". Available: %, Requested: %',
                v_item.product_name, v_item.current_stock, v_item.quantity;
        END IF;
    END LOOP;

    -- 3. Deduct stock and record stock movements
    FOR v_item IN
        SELECT * FROM challan_items WHERE challan_id = p_challan_id
    LOOP
        -- Deduct product stock
        UPDATE products
        SET current_stock = current_stock - v_item.quantity,
            updated_at = NOW()
        WHERE id = v_item.product_id;

        -- Record OUT movement
        INSERT INTO stock_movements (
            product_id,
            quantity,
            movement_type,
            reason,
            created_by,
            created_at
        ) VALUES (
            v_item.product_id,
            v_item.quantity,
            'OUT',
            'Challan Confirmed: ' || v_challan.challan_number,
            p_user_id,
            NOW()
        );
    END LOOP;

    -- 4. Update Challan Status
    UPDATE challans
    SET status = 'CONFIRMED',
        updated_at = NOW()
    WHERE id = p_challan_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Challan confirmed successfully',
        'challan_id', p_challan_id,
        'challan_number', v_challan.challan_number,
        'status', 'CONFIRMED'
    );
END;
$$;
