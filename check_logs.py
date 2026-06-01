#!/usr/bin/env python3
import paramiko
import sys

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_command(ssh, command, timeout=120):
    print(f"\n🔧 {command}")
    print("-" * 50)
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    if output:
        print(output)
    if error:
        print(f"STDERR: {error}")
    return output, error

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected!")
        
        # Check error logs
        run_command(ssh, "pm2 logs device-ws --lines 20 --nostream")
        
        # Find bun location
        run_command(ssh, "which bun || find /root -name 'bun' -type f 2>/dev/null | head -5")
        run_command(ssh, "ls -la /root/.bun/bin/ 2>/dev/null || echo 'No .bun/bin'")
        
        # Check node
        run_command(ssh, "node --version")
        
        # Install bun if needed
        run_command(ssh, "export BUN_INSTALL=/root/.bun && curl -fsSL https://bun.sh/install | bash 2>/dev/null || echo 'Bun install skipped'")
        
        # Check if we can use npx tsx instead
        run_command(ssh, "npm list -g tsx 2>/dev/null || npm install -g tsx")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
