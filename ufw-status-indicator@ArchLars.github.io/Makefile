# Makefile for UFW Status Indicator (forked from illtellyoulater)

UUID = ufw-status-indicator@ArchLars.github.io
EXTENSION_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(UUID)
FILES = extension.js metadata.json prefs.js stylesheet.css README.md
ZIP_FILE = $(UUID).shell-extension.zip

# Default target
all: install

# Install the extension locally
install: $(FILES)
	@echo "Installing extension..."
	@mkdir -p $(EXTENSION_DIR)
	@cp $(FILES) $(EXTENSION_DIR)/ 2>/dev/null || true
	@echo "Installation complete. Restart GNOME Shell to load changes."

# Create a zip file for distribution
pack: $(FILES)
	@echo "Creating extension package..."
	@rm -f $(ZIP_FILE)
	@zip -r $(ZIP_FILE) $(FILES)
	@echo "Package created: $(ZIP_FILE)"

# Enable the extension
enable:
	@gnome-extensions enable $(UUID)
	@echo "Extension enabled"

# Disable the extension
disable:
	@gnome-extensions disable $(UUID)
	@echo "Extension disabled"

# Show extension info
info:
	@gnome-extensions info $(UUID) || echo "Extension not installed"

# Watch logs
logs:
	@echo "Watching GNOME Shell logs for UFW Status Indicator..."
	@journalctl -f -o cat /usr/bin/gnome-shell | grep -E "ufw-status-indicator|UFW"

# Check if cron job is installed
check-cron:
	@echo "Checking for UFW status cron job..."
	@sudo crontab -l | grep ufw-status-indicator || echo "No cron job found"

# Test UFW status reading
test-ufw:
	@echo "Testing UFW status command..."
	@sudo sh -c "LC_ALL=C LANGUAGE=C LANG=C ufw status | grep 'Status:'"

# Clean build artifacts
clean:
	@rm -f $(ZIP_FILE)
	@echo "Cleaned build artifacts"

# Uninstall the extension
uninstall:
	@echo "Uninstalling extension..."
	@rm -rf $(EXTENSION_DIR)
	@echo "Extension uninstalled"

# Lint the code
lint:
	@command -v eslint >/dev/null 2>&1 || { echo "ESLint not found. Install with: npm install -g eslint"; exit 1; }
	@eslint extension.js prefs.js

# Development help
help:
	@echo "UFW Status Indicator - Development Commands"
	@echo "==========================================="
	@echo "make install    - Install the extension locally"
	@echo "make pack       - Create a distribution zip file"
	@echo "make enable     - Enable the extension"
	@echo "make disable    - Disable the extension"
	@echo "make info       - Show extension information"
	@echo "make logs       - Watch GNOME Shell logs"
	@echo "make check-cron - Check if cron job is installed"
	@echo "make test-ufw   - Test UFW status reading"
	@echo "make clean      - Remove build artifacts"
	@echo "make uninstall  - Uninstall the extension"
	@echo "make lint       - Run ESLint on the code"
	@echo "make help       - Show this help message"

.PHONY: all install pack enable disable info logs check-cron test-ufw clean uninstall lint help
