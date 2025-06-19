#!/bin/bash
# UFW Status Indicator installation script
# Forked by ArchLars from illtellyoulater

set -e

EXTENSION_UUID="ufw-status-indicator@ArchLars.github.io"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
LOG_FILE="/var/log/ufw-status-indicator.ext.log"

echo "UFW Status Indicator Installation Script"
echo "========================================"
echo

# Check shell version
GNOME_VERSION=$(gnome-shell --version | cut -d' ' -f3 | cut -d'.' -f1)
if [ "$GNOME_VERSION" -lt 48 ]; then
    echo "Warning: This version is designed for GNOME 48+"
    echo "Your GNOME Shell version: $(gnome-shell --version)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    echo "Error: UFW (Uncomplicated Firewall) is not installed."
    echo "Please install UFW first:"
    echo "  Ubuntu/Debian: sudo apt install ufw"
    echo "  Fedora: sudo dnf install ufw"
    echo "  Arch: sudo pacman -S ufw"
    exit 1
fi

# Create directory
echo "Creating extension directory..."
mkdir -p "$EXTENSION_DIR"

# Copy files
echo "Installing extension files..."
cp extension.js metadata.json stylesheet.css "$EXTENSION_DIR/"
if [ -f "prefs.js" ]; then
    cp prefs.js "$EXTENSION_DIR/"
fi

# Check if cron job exists
echo
echo "Checking for existing cron job..."
if sudo crontab -l 2>/dev/null | grep -q "ufw-status-indicator.ext.log"; then
    echo "✓ Cron job already exists"
else
    echo "Setting up cron job..."
    echo "This requires sudo access to create a system cron job."
    
    # Create temporary file with crontab
    sudo crontab -l 2>/dev/null > /tmp/crontab.tmp || true
    
    # Add cron job
    echo "* * * * * LC_ALL=C LANGUAGE=C LANG=C ufw status | grep \"Status:\" > $LOG_FILE" >> /tmp/crontab.tmp
    sudo crontab /tmp/crontab.tmp
    rm /tmp/crontab.tmp
    
    echo "✓ Cron job installed"
fi

# Create initial log file
echo "Creating initial log file..."
sudo sh -c "LC_ALL=C LANGUAGE=C LANG=C ufw status | grep 'Status:' > $LOG_FILE"
sudo chmod 644 "$LOG_FILE"
echo "✓ Log file created at $LOG_FILE"

# Enable the extension
echo
echo "Enabling extension..."
gnome-extensions enable "$EXTENSION_UUID" 2>/dev/null || {
    echo "Note: Could not auto-enable extension."
    echo "Please enable it manually in GNOME Extensions app after restarting GNOME Shell."
}

echo
echo "Installation complete!"
echo
echo "Next steps:"
echo "1. Restart GNOME Shell:"
echo "   - On X11: Press Alt+F2, type 'r', press Enter"
echo "   - On Wayland: Log out and log back in"
echo "2. The UFW indicator should appear in your top panel"
echo "3. If not visible, enable it in the GNOME Extensions app"
echo
echo "The indicator will show:"
echo "  Green shield = UFW enabled"
echo "  Red shield = UFW disabled"
echo "  Orange shield = Setup required"
