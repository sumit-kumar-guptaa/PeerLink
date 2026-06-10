set -e

echo "===PeerLink VPS Setup Script==="
echo "This script will set up your VPS for running the PeerLink application."

# update system
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# install java
echo "Installing Java..."
sudo apt install -y openjdk-17-jdk

# install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# install Nginx
echo "Installing Nginx..."
sudo apt install -y nginx

# install PM2
echo "Installing PM2..."
sudo npm install -g pm2

#install Maven
echo "Installing Maven..."
sudo apt install -y maven

# Clone the PeerLink github repository
echo "Cloning PeerLink repository..."
git clone https://github.com/sumit-kumar-guptaa/PeerLink.git
cd PeerLink


# Build Backend
echo "Building PeerLink Backend..."
mvn clean package

# Build Frontend
echo "Building PeerLink Frontend..."
cd UI
npm install
npm run build
cd ..

# Set up Nginx
echo "Configuring Nginx..."

# Ensure the default site is removed to avoid conflicts
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
    echo "Removed default Nginx site configuration."
fi

# create the peerlink configuration file with the correct content
echo "Creating /etc/nginx/sites-available/peerlink..."
cat <<EOF | sudo tee /etc/nginx/sites-available/peerlink
server {
    listen 80;
    server_name _ ; # Catch-all for HTTP requests 

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Frontend API
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Aditional security headers]
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
}
EOF

# Create symbolic link to enable the PeerLink site
sudo ln -s /etc/nginx/sites-available/peerlink /etc/nginx/sites-enabled/peerlink

sudo nginx -t
if [ $? -ne 0 ]; then
    sudo systemctl restart nginx
    echo "Nginx configured and restarted successfully."
else
    echo "Nginx configuration test failed. Please check /etc/nginx/nginx.conf and /etc/nginx/sites-available/peerlink."
    exit 1    
fi

# Start the backend using PM2
echo "Starting PeerLink Backend with PM2..."
pm2 start --name peerlink-backend java -- -jar target/PeerLink-0.0.1-SNAPSHOT.jar

# Start the frontend using PM2
echo "Starting PeerLink Frontend with PM2..."
cd UI
pm2 start npm --name peerlink-frontend -- start
cd ..

# save pm2 configuration
pm2 save

# set PM2 to start on boot
echo "Setting PM2 to start on boot..."
pm2 startup

# Follow the instructions prited by the above comand

echo "===setup complete==="
echo "PeerLink is now running on your VPS!"
echo "Backend API: http://localhost:8080 (Internal - accessed via Nginx)"
echo "Frontend API: http://your_lightsail_public_ip (Accessed via your Instence's public IP address)"
echo "you can access your application using your lightsail instance's public IP address in a web browser."
