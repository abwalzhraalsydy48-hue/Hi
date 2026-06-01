#!/usr/bin/env python3
import paramiko
import sys

# VPS Connection Details
VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_command(ssh, command, timeout=120):
    print(f"\n🔧 Executing: {command}")
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
        print("🔌 Connecting to VPS...")
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected!")
        
        # Find project location
        run_command(ssh, "pm2 describe abu-zahra | grep -E 'script|cwd|exec_cwd' | head -5")
        run_command(ssh, "ls -la /root/")
        run_command(ssh, "find /root -name 'package.json' -type f 2>/dev/null | head -10")
        run_command(ssh, "find /var -name 'package.json' -type f 2>/dev/null | head -10")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
