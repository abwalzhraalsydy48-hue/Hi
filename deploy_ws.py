#!/usr/bin/env python3
import paramiko
import time
import sys

# VPS Connection Details
VPS_HOST = "216.128.156.226"
VPS_USER = "root"
VPS_PASSWORD = "Aa12122000@"

def run_command(ssh, command, timeout=60):
    """Run a command on the VPS and return the output"""
    print(f"\n🔧 Executing: {command}")
    print("-" * 50)
    
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    
    # Get output
    output = stdout.read().decode('utf-8')
    error = stderr.read().decode('utf-8')
    exit_code = stdout.channel.recv_exit_status()
    
    if output:
        print(output)
    if error:
        print(f"STDERR: {error}")
    
    return exit_code, output, error

def main():
    print("🚀 Deploying WebSocket Server to VPS...")
    print(f"📍 Host: {VPS_HOST}")
    
    # Create SSH client
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        # Connect to VPS
        print("\n🔌 Connecting to VPS...")
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected successfully!")
        
        # Commands to execute
        commands = [
            # Navigate to project directory
            "cd /root/abu-zahra-server && pwd",
            
            # Pull latest changes
            "cd /root/abu-zahra-server && git pull origin main",
            
            # Install dependencies for device-ws
            "cd /root/abu-zahra-server/mini-services/device-ws && bun install",
            
            # Stop existing device-ws if running
            "pm2 stop device-ws 2>/dev/null || echo 'No existing process'",
            
            # Start device-ws with pm2
            "cd /root/abu-zahra-server/mini-services/device-ws && pm2 start 'bun run index.ts' --name device-ws",
            
            # Copy Caddyfile
            "cp /root/abu-zahra-server/Caddyfile /etc/caddy/Caddyfile",
            
            # Reload Caddy
            "systemctl reload caddy",
            
            # Check status
            "pm2 list",
            
            # Test WebSocket endpoint
            "curl -s -o /dev/null -w '%{http_code}' http://localhost:3004 || echo 'WS server not responding to HTTP (expected)'"
        ]
        
        for cmd in commands:
            try:
                run_command(ssh, cmd, timeout=120)
            except Exception as e:
                print(f"⚠️ Command failed: {cmd}")
                print(f"   Error: {e}")
        
        print("\n" + "=" * 50)
        print("✅ Deployment completed!")
        print("=" * 50)
        
    except paramiko.AuthenticationException:
        print("❌ Authentication failed! Check credentials.")
        sys.exit(1)
    except paramiko.SSHException as e:
        print(f"❌ SSH connection error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        ssh.close()
        print("\n🔌 Connection closed.")

if __name__ == "__main__":
    main()
