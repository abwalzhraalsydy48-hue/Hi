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
    if error and "pm2" not in command.lower():
        print(f"STDERR: {error}")
    return output, error

def main():
    print("🚀 Deploying WebSocket Server to VPS...")
    print(f"📍 Host: {VPS_HOST}")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        print("\n🔌 Connecting to VPS...")
        ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASSWORD, timeout=30)
        print("✅ Connected successfully!")
        
        commands = [
            # Check project location
            "ls -la /opt/abu-zahra-server/",
            
            # Pull latest changes
            "cd /opt/abu-zahra-server && git fetch origin && git pull origin main",
            
            # Check if mini-services/device-ws exists
            "ls -la /opt/abu-zahra-server/mini-services/",
            
            # Install dependencies for device-ws
            "cd /opt/abu-zahra-server/mini-services/device-ws && bun install",
            
            # Stop existing device-ws if running
            "pm2 stop device-ws 2>/dev/null; pm2 delete device-ws 2>/dev/null; echo 'Cleaned up'",
            
            # Start device-ws with pm2
            "cd /opt/abu-zahra-server/mini-services/device-ws && pm2 start 'bun run index.ts' --name device-ws",
            
            # Save pm2 config
            "pm2 save",
            
            # Copy Caddyfile
            "cp /opt/abu-zahra-server/Caddyfile /etc/caddy/Caddyfile",
            
            # Validate Caddy config
            "caddy validate --config /etc/caddy/Caddyfile 2>&1",
            
            # Reload Caddy
            "systemctl reload caddy && echo 'Caddy reloaded'",
            
            # Check status
            "pm2 list",
            
            # Check if port 3004 is listening
            "ss -tlnp | grep 3004"
        ]
        
        for cmd in commands:
            try:
                run_command(ssh, cmd, timeout=120)
            except Exception as e:
                print(f"⚠️ Command failed: {cmd} - {e}")
        
        print("\n" + "=" * 50)
        print("✅ Deployment completed!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        ssh.close()
        print("\n🔌 Connection closed.")

if __name__ == "__main__":
    main()
