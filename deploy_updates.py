#!/usr/bin/env python3
import paramiko
import sys
import time

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_ssh(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('utf-8', errors='replace')

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected!\n")
        
        # Pull latest code
        print("📥 Pulling latest code...")
        print(run_ssh(ssh, "cd /opt/abu-zahra-server && git fetch origin && git reset --hard origin/main"))
        
        # Restart the server
        print("\n🔄 Restarting server...")
        print(run_ssh(ssh, "pm2 restart abu-zahra"))
        
        # Restart device-ws
        print("\n🔄 Restarting device-ws...")
        print(run_ssh(ssh, "pm2 restart device-ws"))
        
        time.sleep(5)
        
        # Check status
        print("\n📊 Server Status:")
        print(run_ssh(ssh, "pm2 list"))
        
        # Test API
        print("\n🧪 Testing API...")
        print(run_ssh(ssh, "curl -s http://localhost:3000/api/v1/stats"))
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
