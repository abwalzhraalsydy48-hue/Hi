#!/usr/bin/env python3
import paramiko
import sys

VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "E%t7SBQUAL2SE[kc"

def run_command(ssh, command, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    output = stdout.read().decode('utf-8')
    if output:
        print(output)

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        
        print("📊 WebSocket Server Logs:")
        print("=" * 50)
        run_command(ssh, "pm2 logs device-ws --lines 10 --nostream 2>/dev/null")
        
        print("\n📊 Server Status:")
        print("=" * 50)
        run_command(ssh, "pm2 list")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        ssh.close()

if __name__ == "__main__":
    main()
