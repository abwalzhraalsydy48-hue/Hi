#!/usr/bin/env python3
import paramiko
import sys
import time

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_ssh(ssh, cmd, timeout=180):
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
        
        # Set PATH and build
        print("🔨 Building project...")
        cmd = """
        export PATH="/root/.bun/bin:$PATH"
        cd /opt/abu-zahra-server
        bun run build
        """
        out, err = run_ssh(ssh, cmd, timeout=300)
        if "error" in err.lower() or "failed" in err.lower():
            print(f"Error: {err[-1000:]}")
        else:
            print(f"Build output: {out[-500:]}")
        
        # Restart servers
        print("\n🔄 Restarting servers...")
        run_ssh(ssh, "pm2 restart abu-zahra")
        run_ssh(ssh, "pm2 restart device-ws")
        
        time.sleep(5)
        
        # Check status
        print("\n📊 Status:")
        out, _ = run_ssh(ssh, "pm2 list")
        print(out)
        
        # Test endpoint
        print("\n🧪 Testing endpoints...")
        out, _ = run_ssh(ssh, "curl -s -X POST http://localhost:3000/api/v1/device/test/info -H 'Content-Type: application/json' -d '{\"name\":\"Test\"}'")
        print(f"Info endpoint: {out[:200]}")
        
        out, _ = run_ssh(ssh, "curl -s http://localhost:3000/api/v1/stats")
        print(f"Stats: {out}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
