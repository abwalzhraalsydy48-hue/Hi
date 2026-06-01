#!/usr/bin/env python3
import paramiko
import sys
import time

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_ssh(ssh, cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected!\n")
        
        # Pull latest code
        print("📥 Pulling latest code...")
        out, err = run_ssh(ssh, "cd /opt/abu-zahra-server && git fetch origin && git reset --hard origin/main")
        print(out[:500] if out else err[:500])
        
        # Rebuild the project
        print("\n🔨 Rebuilding project...")
        out, err = run_ssh(ssh, "cd /opt/abu-zahra-server && bun run build", timeout=300)
        print(out[-1000:] if out else f"Error: {err[-500:]}")
        
        # Restart the server
        print("\n🔄 Restarting servers...")
        run_ssh(ssh, "pm2 restart abu-zahra")
        run_ssh(ssh, "pm2 restart device-ws")
        
        time.sleep(5)
        
        # Check status
        print("\n📊 Server Status:")
        out, _ = run_ssh(ssh, "pm2 list")
        print(out)
        
        # Test new endpoint
        print("\n🧪 Testing info endpoint...")
        out, _ = run_ssh(ssh, "curl -s -X POST http://localhost:3000/api/v1/device/test123/info -H 'Content-Type: application/json' -d '{\"name\":\"Test Device\"}'")
        print(out)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
