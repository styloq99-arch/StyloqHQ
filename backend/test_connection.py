import sys
import os

output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_output.txt")
lines = []

try:
    import psycopg2
    lines.append("psycopg2 imported OK")
    
    conn = psycopg2.connect(
        host='aws-0-ap-southeast-1.pooler.supabase.com',
        port=5432,
        dbname='postgres',
        user='postgres.sbtmqbfkcswsgkjimujf',
        password='S4KSzzLKg5.7CM-'
    )
    cur = conn.cursor()
    cur.execute('SELECT version()')
    lines.append("CONNECTION SUCCESS: " + str(cur.fetchone()[0]))
    
    # List all tables
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    """)
    tables = cur.fetchall()
    lines.append(f"\nTables in database ({len(tables)}):")
    for t in tables:
        lines.append(f"  - {t[0]}")
    
    conn.close()
    lines.append("\nDone!")
except Exception as e:
    lines.append(f"ERROR: {type(e).__name__}: {e}")

with open(output_path, "w") as f:
    f.write("\n".join(lines))
