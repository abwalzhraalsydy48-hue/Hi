#!/usr/bin/env python3
import paramiko
import sys
import time

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_command(ssh, command, timeout=30):
    print(f"\n🔧 {command}")
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    if output:
        print(output[:1000])
    return output, error

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected!")
        
        # Stop old process
        run_command(ssh, "pm2 delete device-ws 2>/dev/null; echo done")
        
        # Start with full path
        run_command(ssh, "cd /opt/abu-zahra-server/mini-services/device-ws && pm2 start '/root/.bun/bin/bun' --name device-ws -- run index.ts")
        
        # Save
        run_command(ssh, "pm2 save")
        
        time.sleep(2)
        
        # Status
        run_command(ssh, "pm2 list")
        
        # Port check
        run_command(ssh, "ss -tlnp | grep 3004 || echo 'Port 3004 not listening'")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
