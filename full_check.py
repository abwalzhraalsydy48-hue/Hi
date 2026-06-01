#!/usr/bin/env python3
import paramiko
import sys

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_ssh_command(ssh, command, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    output = stdout.read().decode('utf-8', errors='replace')
    error = stderr.read().decode('utf-8', errors='replace')
    return output, error

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected to VPS\n")
        
        print("=" * 60)
        print("📊 1. DATABASE CHECK")
        print("=" * 60)
        
        # Check database tables
        out, err = run_ssh_command(ssh, "sqlite3 /opt/abu-zahra-server/db/custom.db '.tables'")
        print(f"Tables: {out.strip()}")
        
        # Check devices
        out, err = run_ssh_command(ssh, "sqlite3 /opt/abu-zahra-server/db/custom.db 'SELECT id, name, model, isOnline, lastSeen FROM Device;'")
        print(f"\n📱 Devices:\n{out}")
        
        # Check link codes
        out, err = run_ssh_command(ssh, "sqlite3 /opt/abu-zahra-server/db/custom.db 'SELECT id, code, used, deviceId FROM LinkCode ORDER BY createdAt DESC LIMIT 10;'")
        print(f"\n🔗 Link Codes:\n{out}")
        
        # Check commands
        out, err = run_ssh_command(ssh, "sqlite3 /opt/abu-zahra-server/db/custom.db 'SELECT id, type, status, deviceId FROM Command ORDER BY createdAt DESC LIMIT 10;'")
        print(f"\n⚡ Commands:\n{out}")
        
        print("\n" + "=" * 60)
        print("📊 2. API ENDPOINTS TEST")
        print("=" * 60)
        
        # Test devices API
        out, err = run_ssh_command(ssh, "curl -s http://localhost:3000/api/devices")
        print(f"\n📱 /api/devices:\n{out[:800]}")
        
        # Test v1 stats
        out, err = run_ssh_command(ssh, "curl -s http://localhost:3000/api/v1/stats")
        print(f"\n📊 /api/v1/stats:\n{out}")
        
        # Test commands API
        out, err = run_ssh_command(ssh, "curl -s http://localhost:3000/api/commands")
        print(f"\n⚡ /api/commands:\n{out[:500]}")
        
        print("\n" + "=" * 60)
        print("📊 3. SERVER STATUS")
        print("=" * 60)
        
        out, err = run_ssh_command(ssh, "pm2 list")
        print(f"\n{out}")
        
        out, err = run_ssh_command(ssh, "ss -tlnp | grep -E '3000|3004'")
        print(f"Listening Ports:\n{out}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
