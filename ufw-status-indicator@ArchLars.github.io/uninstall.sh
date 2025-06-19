#!/bin/bash
# UFW Status Indicator uninstallation script
# Forked by ArchLars from illtellyoulater

set -e

EXTENSION_UUID="ufw-status-indicator@ArchLars.github.io"
EXTENSION_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
LOG_FILE="/var/log/ufw-status-indicator.ext.log"

echo "UFW Status Indicator Uninstall Script"
echo "====================================="
echo

# 1. Disable the extension
echo "Disabling GNOME extension..."
if gnome-extensions list | grep -q "^${EXTENSION_UUID}$"; then
    gnome-extensions disable "$EXTENSION_UUID"
    echo "✓ Extension disabled."
else
    echo "→ Extension not found or already disabled."
fi

# 2. Remove extension files
echo
if [ -d "$EXTENSION_DIR" ]; then
    echo "Removing extension directory: $EXTENSION_DIR"
    rm -rf "$EXTENSION_DIR"
    echo "✓ Extension directory removed."
else
    echo "→ No extension directory at $EXTENSION_DIR."
fi

# 3. Remove cron job
echo
echo "Removing root cron job for status logging..."
# Dump current crontab, filter out our job, then reinstall
TMP_CRON="$(mktemp)"
sudo crontab -l 2>/dev/null | grep -v -F "$LOG_FILE" > "$TMP_CRON" || true
sudo crontab "$TMP_CRON"
rm -f "$TMP_CRON"
echo "✓ Cron job entries referencing $LOG_FILE removed."

# 4. Delete log file
echo
if [ -f "$LOG_FILE" ]; then
    echo "Deleting log file: $LOG_FILE"
    sudo rm -f "$LOG_FILE"
    echo "✓ Log file deleted."
else
    echo "→ No log file at $LOG_FILE."
fi

echo
echo "Uninstallation complete!"
echo
echo "To finalize, restart GNOME Shell:"
echo "  • On X11: Alt+F2 → r → Enter"
echo "  • On Wayland: Log out and back in"
echo
